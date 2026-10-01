import { UserId } from '../../shared/core/value-objects/UserId';
import { Result } from '../../shared/result';
import { ErrorAbstract } from '../../shared/error-abstract';
import { DatabaseError } from '../../shared/DatabaseError';
import { GlucoseValue } from '../../glucose/core/value-objects/GlucoseValue';
import { GlucoseMealTag } from '../../glucose/core/value-objects/GlucoseMealTag';
import { GlucoseDate } from '../../glucose/core/value-objects/GlucoseDate';
import { GlucoseTime } from '../../glucose/core/value-objects/GlucoseTime';
import { HbA1cValue } from '../../glucose/core/value-objects/HbA1cValue';
import { HbA1cExamDate } from '../../glucose/core/value-objects/HbA1cExamDate';
import { TipoInsulina } from '../../insulina/core/value-objects/TipoInsulina';
import { Dosis } from '../../insulina/core/value-objects/Dosis';
import { FechaInsulina } from '../../insulina/core/value-objects/FechaInsulina';
import { HoraInsulina } from '../../insulina/core/value-objects/HoraInsulina';
import { ZonaInyeccion } from '../../insulina/core/value-objects/ZonaInyeccion';
import { ContextoAplicacion } from '../../insulina/core/value-objects/ContextoAplicacion';
import { Peso } from '../../IMC/core/value-objects/peso';
import { Altura } from '../../IMC/core/value-objects/altura';
import { Fecha } from '../../IMC/core/value-objects/Fecha';
import { ContactName } from '../../contact_emergence/core/value-objects/ContactName';
import { ContactParentesco } from '../../contact_emergence/core/value-objects/ContactParentesco';
import { ProfileImg } from '../../preference/core/value-objects/ProfileImg';
import { UnitMeasure } from '../../preference/core/value-objects/UnitMeasure';
import { Thresholds } from '../../preference/core/value-objects/Thresholds';
import { InsulinRatios } from '../../preference/core/value-objects/InsulinRatios';
import { SensitivityFactor } from '../../preference/core/value-objects/SensitivityFactor';
import { CorrectionSchemas } from '../../preference/core/value-objects/CorrectionSchemas';
import { BasalSchemas } from '../../preference/core/value-objects/BasalSchemas';
import {
  RejectedChange,
  PushResult,
  SyncChangesMap,
  SyncTableName,
  TableChanges,
  isSyncTable,
} from '../core/SyncChanges';
import { SyncRepository, SyncRow, SyncWriteOp } from '../core/SyncRepository';
import { SyncPayloadInvalidError } from '../core/errors/SyncPayloadInvalidError';

interface ValidatedRecord {
  data?: Record<string, unknown>;
  error?: string;
}

export class PushChanges {
  constructor(private readonly syncRepository: SyncRepository) {}

  public async run(input: {
    userId: string;
    changes: unknown;
  }): Promise<Result<PushResult, ErrorAbstract>> {
    const userIdRes = UserId.create(input.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    const parseRes = this.parseChanges(input.changes);
    if (parseRes.error) {
      return Result.fail(new SyncPayloadInvalidError(parseRes.error));
    }

    const rejected: RejectedChange[] = [];
    const ops: SyncWriteOp[] = [];
    const serverNow = Date.now();

    for (const table of parseRes.unknownTables) {
      rejected.push({
        table,
        id: null,
        reason: 'Tabla desconocida (ignorada)',
      });
    }

    try {
      for (const [table, tableChanges] of Object.entries(parseRes.map)) {
        await this.processTable(
          table as SyncTableName,
          tableChanges as TableChanges,
          input.userId,
          serverNow,
          ops,
          rejected,
        );
      }

      if (ops.length > 0) {
        await this.syncRepository.applyWrites(ops);
      }

      return Result.ok({ applied: ops.length, rejected });
    } catch (error) {
      console.error('Error en PushChanges:', error);
      return Result.fail(
        new DatabaseError('Error al aplicar los cambios de sincronización'),
      );
    }
  }

  // --- SHAPE ---

  private parseChanges(changes: unknown): {
    map: SyncChangesMap;
    unknownTables: string[];
    error?: string;
  } {
    if (
      typeof changes !== 'object' ||
      changes === null ||
      Array.isArray(changes)
    ) {
      return {
        map: {},
        unknownTables: [],
        error: 'changes debe ser un objeto',
      };
    }
    const map: SyncChangesMap = {};
    const unknownTables: string[] = [];
    for (const [table, value] of Object.entries(
      changes as Record<string, unknown>,
    )) {
      if (!isSyncTable(table)) {
        unknownTables.push(table);
        continue;
      }
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return {
          map,
          unknownTables,
          error: `changes.${table} debe ser un objeto`,
        };
      }
      const tc = value as Record<string, unknown>;
      for (const key of ['created', 'updated', 'deleted']) {
        if (tc[key] !== undefined && !Array.isArray(tc[key])) {
          return {
            map,
            unknownTables,
            error: `changes.${table}.${key} debe ser un arreglo`,
          };
        }
      }
      map[table] = tc as TableChanges;
    }
    return { map, unknownTables };
  }

  // --- PROCESADO POR TABLA ---

  private async processTable(
    table: SyncTableName,
    changes: TableChanges,
    userId: string,
    serverNow: number,
    ops: SyncWriteOp[],
    rejected: RejectedChange[],
  ): Promise<void> {
    const created = Array.isArray(changes.created) ? changes.created : [];
    const updated = Array.isArray(changes.updated) ? changes.updated : [];
    const deleted = Array.isArray(changes.deleted) ? changes.deleted : [];

    // 1. Validar created/updated (estado completo del registro)
    const incoming: {
      id: string;
      data: Record<string, unknown>;
      createdAt: Date;
      updatedAt: Date;
    }[] = [];
    for (const rec of [...created, ...updated]) {
      if (typeof rec !== 'object' || rec === null || Array.isArray(rec)) {
        rejected.push({
          table,
          id: null,
          reason: 'El registro debe ser un objeto',
        });
        continue;
      }
      const id = typeof rec.id === 'string' ? rec.id : null;
      if (!id) {
        rejected.push({
          table,
          id: null,
          reason: 'id es requerido (UUID generado por el cliente)',
        });
        continue;
      }
      const validated = this.validateRecord(table, rec);
      if (validated.error || !validated.data) {
        rejected.push({
          table,
          id,
          reason: validated.error ?? 'Registro inválido',
        });
        continue;
      }
      const createdAtMs = this.clampMs(
        this.toMs(rec.createdAt) ?? serverNow,
        serverNow,
      );
      const updatedAtMs = this.clampMs(
        this.toMs(rec.updatedAt) ?? serverNow,
        serverNow,
      );
      incoming.push({
        id,
        data: validated.data,
        createdAt: new Date(createdAtMs),
        updatedAt: new Date(updatedAtMs),
      });
    }

    // 2. Validar deleted (solo IDs)
    const deletedIds: string[] = [];
    for (const id of deleted) {
      if (typeof id !== 'string') {
        rejected.push({
          table,
          id: null,
          reason: 'Los IDs eliminados deben ser strings',
        });
        continue;
      }
      if (table === 'preference') {
        rejected.push({
          table,
          id,
          reason: 'La eliminación de preferencias no está soportada',
        });
        continue;
      }
      deletedIds.push(id);
    }

    // 3. Cargar estado del servidor para LWW
    const idsToCheck = [
      ...new Set([...incoming.map((i) => i.id), ...deletedIds]),
    ];
    const rows = await this.syncRepository.findRowsByIds(
      table,
      userId,
      idsToCheck,
    );

    // updatedAt proyectado por registro dentro de este lote (LWW intra-lote)
    const pending = new Map<string, Date>();

    for (const item of incoming) {
      const existing = rows.get(item.id);
      const existingUpdatedAtMs =
        this.toMs(pending.get(item.id)) ??
        (existing ? this.toMs((existing as SyncRow).updatedAt) : undefined);
      if (
        existingUpdatedAtMs !== undefined &&
        item.updatedAt.getTime() <= existingUpdatedAtMs
      ) {
        // El servidor (o el propio lote) ya tiene un cambio igual o más nuevo: skip
        continue;
      }
      ops.push({
        kind: 'upsert',
        table,
        key: item.id,
        userId,
        data: item.data,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
      pending.set(item.id, item.updatedAt);
    }

    for (const id of deletedIds) {
      const existing = rows.get(id);
      const pendingUpdatedAt = pending.get(id);
      if (!existing && !pendingUpdatedAt) continue; // ya no existe: idempotente
      const existingUpdatedAtMs =
        this.toMs(pendingUpdatedAt) ??
        (existing ? this.toMs((existing as SyncRow).updatedAt) : undefined);
      const serverNowDate = new Date(serverNow);
      if (
        existingUpdatedAtMs !== undefined &&
        serverNowDate.getTime() <= existingUpdatedAtMs
      ) {
        // En la práctica nunca debería ocurrir (serverNow >= cualquier clamp),
        // pero garantiza monotonia si el reloj del cliente va adelantado.
        continue;
      }
      ops.push({
        kind: 'softDelete',
        table,
        key: id,
        updatedAt: serverNowDate,
      });
      pending.set(id, serverNowDate);
    }
  }

  // --- VALIDACIÓN POR TABLA ---

  private validateRecord(
    table: SyncTableName,
    rec: Record<string, unknown>,
  ): ValidatedRecord {
    switch (table) {
      case 'glucose':
        return this.validateGlucose(rec);
      case 'hba1c':
        return this.validateHbA1c(rec);
      case 'insulina':
        return this.validateInsulina(rec);
      case 'imc':
        return this.validateImc(rec);
      case 'contactEmergence':
        return this.validateContactEmergence(rec);
      case 'preference':
        return this.validatePreference(rec);
    }
  }

  private validateGlucose(rec: Record<string, unknown>): ValidatedRecord {
    const valueMgdl = this.asNumber(rec.valueMgdl);
    if (valueMgdl === undefined)
      return { error: 'valueMgdl es requerido y debe ser numérico' };
    const valueRes = GlucoseValue.create(valueMgdl);
    if (!valueRes.isValid) return { error: valueRes.getError().message };

    const mealTag = this.asString(rec.mealTag);
    if (mealTag === undefined) return { error: 'mealTag es requerido' };
    const tagRes = GlucoseMealTag.create(mealTag);
    if (!tagRes.isValid) return { error: tagRes.getError().message };

    const dateValue = this.toDate(rec.date);
    if (!dateValue) return { error: 'date es requerido (ISO 8601 o epoch ms)' };
    const dateRes = GlucoseDate.create(dateValue);
    if (!dateRes.isValid) return { error: dateRes.getError().message };

    const time = this.asString(rec.time);
    if (time === undefined) return { error: 'time es requerido' };
    const timeRes = GlucoseTime.create(time);
    if (!timeRes.isValid) return { error: timeRes.getError().message };

    return { data: { valueMgdl, mealTag, date: dateValue, time } };
  }

  private validateHbA1c(rec: Record<string, unknown>): ValidatedRecord {
    const valuePercent = this.asNumber(rec.valuePercent);
    if (valuePercent === undefined)
      return { error: 'valuePercent es requerido y debe ser numérico' };
    const valueRes = HbA1cValue.create(valuePercent);
    if (!valueRes.isValid) return { error: valueRes.getError().message };

    const examDate = this.toDate(rec.examDate);
    if (!examDate)
      return { error: 'examDate es requerido (ISO 8601 o epoch ms)' };
    const examRes = HbA1cExamDate.create(examDate);
    if (!examRes.isValid) return { error: examRes.getError().message };

    return { data: { valuePercent, examDate } };
  }

  private validateInsulina(rec: Record<string, unknown>): ValidatedRecord {
    const tipo = this.asString(rec.tipo);
    if (tipo === undefined) return { error: 'tipo es requerido' };
    const tipoRes = TipoInsulina.create(tipo);
    if (!tipoRes.isValid) return { error: tipoRes.getError().message };

    const dosis = this.asNumber(rec.dosis);
    if (dosis === undefined)
      return { error: 'dosis es requerida y debe ser numérica' };
    const dosisRes = Dosis.create(dosis);
    if (!dosisRes.isValid) return { error: dosisRes.getError().message };
    const unidades = this.asNumber(rec.unidades) ?? dosis;

    const fechaDate = this.toDate(rec.fecha);
    if (!fechaDate)
      return { error: 'fecha es requerida (ISO 8601 o epoch ms)' };
    const fechaRes = FechaInsulina.create(
      fechaDate.getDate(),
      fechaDate.getMonth() + 1,
      fechaDate.getFullYear(),
    );
    if (!fechaRes.isValid) return { error: fechaRes.getError().message };

    const hora = this.asString(rec.hora);
    if (hora === undefined) return { error: 'hora es requerida' };
    const horaRes = HoraInsulina.create(hora);
    if (!horaRes.isValid) return { error: horaRes.getError().message };

    const zona = this.asString(rec.zona);
    if (zona === undefined) return { error: 'zona es requerida' };
    const zonaRes = ZonaInyeccion.create(zona);
    if (!zonaRes.isValid) return { error: zonaRes.getError().message };

    let contexto: string | null = null;
    if (rec.contexto !== undefined && rec.contexto !== null) {
      const contextoStr = this.asString(rec.contexto);
      if (contextoStr === undefined)
        return { error: 'contexto debe ser un string o null' };
      const ctxRes = ContextoAplicacion.create(contextoStr);
      if (!ctxRes.isValid) return { error: ctxRes.getError().message };
      contexto = contextoStr;
    }

    return {
      data: {
        tipo: tipoRes.getValue().toString(),
        dosis,
        unidades,
        fecha: fechaRes.getValue().value,
        hora: horaRes.getValue().toString(),
        zona: zonaRes.getValue().toString(),
        contexto,
      },
    };
  }

  private validateImc(rec: Record<string, unknown>): ValidatedRecord {
    const peso = this.asNumber(rec.peso);
    if (peso === undefined)
      return { error: 'peso es requerido y debe ser numérico' };
    const pesoRes = Peso.create(peso);
    if (!pesoRes.isValid) return { error: pesoRes.getError().message };

    const altura = this.asNumber(rec.altura);
    if (altura === undefined)
      return { error: 'altura es requerida y debe ser numérica' };
    const alturaRes = Altura.create(altura);
    if (!alturaRes.isValid) return { error: alturaRes.getError().message };

    const fechaValue = this.toDate(rec.fecha);
    if (!fechaValue)
      return { error: 'fecha es requerida (ISO 8601 o epoch ms)' };
    const fechaRes = Fecha.fromDate(fechaValue);
    if (!fechaRes.isValid) return { error: fechaRes.getError().message };

    const alturaM = altura / 100;
    const imcValue = peso / (alturaM * alturaM);
    if (!Number.isFinite(imcValue))
      return { error: 'No se pudo calcular el IMC con los valores dados' };

    return {
      data: { peso, altura, imcValue, fecha: fechaRes.getValue().valor },
    };
  }

  private validateContactEmergence(
    rec: Record<string, unknown>,
  ): ValidatedRecord {
    const name = this.asString(rec.name);
    if (name === undefined) return { error: 'name es requerido' };
    const nameRes = ContactName.create(name);
    if (!nameRes.isValid) return { error: nameRes.getError().message };

    const parentesco = this.asString(rec.parentesco);
    if (parentesco === undefined) return { error: 'parentesco es requerido' };
    const parentescoRes = ContactParentesco.create(parentesco);
    if (!parentescoRes.isValid)
      return { error: parentescoRes.getError().message };

    let telefono: string | null = null;
    if (rec.telefono !== undefined && rec.telefono !== null) {
      const telefonoStr = this.asString(rec.telefono);
      if (telefonoStr === undefined)
        return { error: 'telefono debe ser un string o null' };
      telefono = telefonoStr;
    }

    return { data: { name, parentesco, telefono } };
  }

  private validatePreference(rec: Record<string, unknown>): ValidatedRecord {
    const profileImg = this.asString(rec.profileImg);
    if (profileImg === undefined) return { error: 'profileImg es requerido' };
    const imgRes = ProfileImg.create(profileImg);
    if (!imgRes.isValid) return { error: imgRes.getError().message };

    const unitMeasure = this.asString(rec.unitMeasure);
    if (unitMeasure === undefined) return { error: 'unitMeasure es requerido' };
    const unitRes = UnitMeasure.create(unitMeasure);
    if (!unitRes.isValid) return { error: unitRes.getError().message };

    const thresholdsRaw = rec.thresholds;
    const hypo = this.asNumber(
      typeof thresholdsRaw === 'object' && thresholdsRaw !== null
        ? (thresholdsRaw as any).hypo
        : undefined,
    );
    const hiper = this.asNumber(
      typeof thresholdsRaw === 'object' && thresholdsRaw !== null
        ? (thresholdsRaw as any).hiper
        : undefined,
    );
    if (hypo === undefined || hiper === undefined) {
      return { error: 'thresholds con hypo e hiper numéricos es requerido' };
    }
    const thresholdsRes = Thresholds.create({ hypo, hiper });
    if (!thresholdsRes.isValid)
      return { error: thresholdsRes.getError().message };

    const ratiosRaw = rec.insulinRatios;
    const breakfast = this.asNumber(
      typeof ratiosRaw === 'object' && ratiosRaw !== null
        ? (ratiosRaw as any).breakfast
        : undefined,
    );
    const lunch = this.asNumber(
      typeof ratiosRaw === 'object' && ratiosRaw !== null
        ? (ratiosRaw as any).lunch
        : undefined,
    );
    const dinner = this.asNumber(
      typeof ratiosRaw === 'object' && ratiosRaw !== null
        ? (ratiosRaw as any).dinner
        : undefined,
    );
    if (
      breakfast === undefined ||
      lunch === undefined ||
      dinner === undefined
    ) {
      return {
        error:
          'insulinRatios con breakfast, lunch y dinner numéricos es requerido',
      };
    }
    const ratiosRes = InsulinRatios.create(breakfast, lunch, dinner);
    if (!ratiosRes.isValid) return { error: ratiosRes.getError().message };

    const sensitivity = this.asNumber(rec.sensitivity);
    if (sensitivity === undefined)
      return { error: 'sensitivity es requerido y debe ser numérico' };
    const sensitivityRes = SensitivityFactor.create(sensitivity);
    if (!sensitivityRes.isValid)
      return { error: sensitivityRes.getError().message };

    const correctionSchemas = Array.isArray(rec.correctionSchemas)
      ? rec.correctionSchemas
      : null;
    const correctionRes = CorrectionSchemas.create(correctionSchemas as any);
    if (!correctionRes.isValid)
      return { error: correctionRes.getError().message };

    const basalSchemas = Array.isArray(rec.basalSchemas)
      ? rec.basalSchemas
      : null;
    const basalRes = BasalSchemas.create(basalSchemas as any);
    if (!basalRes.isValid) return { error: basalRes.getError().message };

    return {
      data: {
        profileImg,
        unitMeasure,
        thresholds: { hypo, hiper },
        insulinRatios: { breakfast, lunch, dinner },
        sensitivity,
        correctionSchemas: correctionSchemas ?? null,
        basalSchemas: basalSchemas ?? null,
      },
    };
  }

  // --- HELPERS ---

  private asNumber(v: unknown): number | undefined {
    return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
  }

  private asString(v: unknown): string | undefined {
    return typeof v === 'string' ? v : undefined;
  }

  private toMs(v: unknown): number | undefined {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      const parsed = Date.parse(v);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    if (v instanceof Date) return v.getTime();
    return undefined;
  }

  private toDate(v: unknown): Date | undefined {
    const ms = this.toMs(v);
    return ms === undefined ? undefined : new Date(ms);
  }

  private clampMs(ms: number, serverNow: number): number {
    return Math.min(ms, serverNow);
  }
}
