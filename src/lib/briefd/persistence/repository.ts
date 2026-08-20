import { randomUUID } from "node:crypto";
import postgres, { type Sql, type TransactionSql } from "postgres";
import type { MediaPlanColumnMapping, MediaPlanRow } from "@/lib/jobOrchestrator";
import type {
  CategoryTag,
  DimensionUnit,
  FormatData,
  FormatRequirements,
  FormatSource,
  SectionCategory,
  SpecTrust,
} from "@/lib/briefd/types";
import { assertCampaignSnapshot, unresolvedRowIds, type CampaignSnapshot } from "./contracts";
import {
  CampaignService,
  type CampaignRepository,
  type StoredCampaign,
  type StoredShare,
} from "./service";

interface CampaignDatabaseRow {
  id: string;
  owner_session_hash: string;
  name: string;
  client_name: string;
  source_filename: string | null;
  sheet_name: string;
  header_row: number;
  column_mapping: unknown;
  revision: number | string;
}

interface CampaignRowDatabaseRow {
  source_row_id: string;
  sheet_name: string;
  row_number: number;
  campaign_name: string;
  publisher: string;
  format_name: string;
  deadline: string | null;
  deadline_raw: string;
  notes: string;
  raw_values: unknown;
}

interface FormatDatabaseRow {
  source_row_id: string;
  trust: SpecTrust;
  brain_spec_id: string | null;
  category: SectionCategory;
  category_tag: CategoryTag;
  publisher: string;
  format_name: string;
  width: number;
  height: number;
  unit: DimensionUnit;
  visible_width: number | null;
  visible_height: number | null;
  deadline: string | null;
  deadline_raw: string | null;
  requirements: unknown;
  file_types: unknown;
  source_evidence: unknown | null;
  notes: string | null;
  metadata: string | null;
}

interface ShareDatabaseRow {
  id: string;
  campaign_id: string;
  token_hash: string;
  created_at: Date | string;
  expires_at: Date | string | null;
  revoked_at: Date | string | null;
}

function asIsoTimestamp(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Database returned an invalid share timestamp.");
  return date.toISOString();
}

function asStringRecord(value: unknown, field: string): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value) || !Object.values(value).every((entry) => typeof entry === "string")) {
    throw new Error(`Database returned invalid ${field}.`);
  }
  return value as Record<string, string>;
}

function asColumnMapping(value: unknown): MediaPlanColumnMapping {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Database returned an invalid column mapping.");
  return value as MediaPlanColumnMapping;
}

function asRequirements(value: unknown): FormatRequirements {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Database returned invalid format requirements.");
  return value as FormatRequirements;
}

function asFileTypes(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string")) throw new Error("Database returned invalid file types.");
  return value;
}

function asSource(value: unknown | null): FormatSource | undefined {
  if (value === null) return undefined;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Database returned invalid source evidence.");
  return value as FormatSource;
}

function storedShare(row: ShareDatabaseRow): StoredShare {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    tokenHash: row.token_hash,
    createdAt: asIsoTimestamp(row.created_at),
    expiresAt: row.expires_at === null ? null : asIsoTimestamp(row.expires_at),
    revokedAt: row.revoked_at === null ? null : asIsoTimestamp(row.revoked_at),
  };
}

async function insertSnapshotRows(sql: TransactionSql, snapshot: CampaignSnapshot): Promise<void> {
  const databaseRowIds = new Map<string, string>();

  for (const [sortOrder, row] of snapshot.rows.entries()) {
    const databaseRowId = randomUUID();
    databaseRowIds.set(row.id, databaseRowId);
    await sql`
      INSERT INTO briefd_campaign_rows (
        id, campaign_id, source_row_id, sheet_name, row_number, campaign_name,
        publisher, format_name, deadline, deadline_raw, notes, raw_values, sort_order
      ) VALUES (
        ${databaseRowId}, ${snapshot.id}, ${row.id}, ${row.source.sheetName},
        ${row.source.rowNumber}, ${row.campaign}, ${row.publisher}, ${row.format},
        ${row.deadline}, ${row.deadlineRaw}, ${row.notes}, ${sql.json(row.rawValues)},
        ${sortOrder}
      )
    `;
  }

  for (const [sortOrder, format] of snapshot.formats.entries()) {
    const campaignRowId = databaseRowIds.get(format.id);
    if (!campaignRowId) throw new Error(`Resolved format ${format.id} does not belong to a stored campaign row.`);
    await sql`
      INSERT INTO briefd_resolved_formats (
        id, campaign_row_id, trust, brain_spec_id, category, category_tag,
        publisher, format_name, width, height, unit, visible_width, visible_height,
        deadline, deadline_raw, requirements, file_types, source_evidence, notes,
        metadata, sort_order
      ) VALUES (
        ${randomUUID()}, ${campaignRowId}, ${format.trust}, ${format.specId ?? null},
        ${format.sectionCategory}, ${format.categoryTag}, ${format.publisher},
        ${format.formatName}, ${format.dimensions.width}, ${format.dimensions.height},
        ${format.dimensions.unit}, ${format.dimensions.visibleWidth ?? null},
        ${format.dimensions.visibleHeight ?? null}, ${format.deadline},
        ${format.deadlineRaw ?? null}, ${sql.json({ ...format.requirements })},
        ${sql.json(format.fileTypes)}, ${format.source ? sql.json({ ...format.source }) : null},
        ${format.notes ?? null}, ${format.metadata ?? null}, ${sortOrder}
      )
    `;
  }
}

async function readCampaign(sql: TransactionSql, id: string): Promise<StoredCampaign | null> {
  const campaignRows = await sql<CampaignDatabaseRow[]>`
    SELECT id, owner_session_hash, name, client_name, source_filename, sheet_name,
           header_row, column_mapping, revision
      FROM briefd_campaigns
     WHERE id = ${id}
  `;
  const campaign = campaignRows[0];
  if (!campaign) return null;

  const storedRows = await sql<CampaignRowDatabaseRow[]>`
    SELECT source_row_id, sheet_name, row_number, campaign_name, publisher,
           format_name, deadline::text AS deadline, deadline_raw, notes, raw_values
      FROM briefd_campaign_rows
     WHERE campaign_id = ${id}
     ORDER BY sort_order ASC, row_number ASC, id ASC
  `;
  const rows: MediaPlanRow[] = storedRows.map((row) => ({
    id: row.source_row_id,
    source: { sheetName: row.sheet_name, rowNumber: row.row_number },
    campaign: row.campaign_name,
    publisher: row.publisher,
    format: row.format_name,
    deadline: row.deadline,
    deadlineRaw: row.deadline_raw,
    notes: row.notes,
    rawValues: asStringRecord(row.raw_values, "raw row values"),
  }));
  const sourceRows = new Map(rows.map((row) => [row.id, row.source]));

  const storedFormats = await sql<FormatDatabaseRow[]>`
    SELECT r.source_row_id, f.trust, f.brain_spec_id, f.category, f.category_tag,
           f.publisher, f.format_name, f.width, f.height, f.unit,
           f.visible_width, f.visible_height, f.deadline::text AS deadline,
           f.deadline_raw, f.requirements, f.file_types, f.source_evidence,
           f.notes, f.metadata
      FROM briefd_resolved_formats AS f
      JOIN briefd_campaign_rows AS r ON r.id = f.campaign_row_id
     WHERE r.campaign_id = ${id}
     ORDER BY f.sort_order ASC, r.row_number ASC, r.id ASC
  `;
  const formats: FormatData[] = storedFormats.map((format) => {
    const sourceRow = sourceRows.get(format.source_row_id);
    if (!sourceRow) throw new Error(`Database format ${format.source_row_id} has no campaign row.`);
    return {
      id: format.source_row_id,
      ...(format.brain_spec_id === null ? {} : { specId: format.brain_spec_id }),
      categoryTag: format.category_tag,
      publisher: format.publisher,
      formatName: format.format_name,
      sectionCategory: format.category,
      dimensions: {
        width: format.width,
        height: format.height,
        unit: format.unit,
        ...(format.visible_width === null ? {} : { visibleWidth: format.visible_width }),
        ...(format.visible_height === null ? {} : { visibleHeight: format.visible_height }),
      },
      deadline: format.deadline,
      ...(format.deadline_raw === null ? {} : { deadlineRaw: format.deadline_raw }),
      requirements: asRequirements(format.requirements),
      fileTypes: asFileTypes(format.file_types),
      trust: format.trust,
      ...(format.source_evidence === null ? {} : { source: asSource(format.source_evidence) }),
      sourceRow,
      ...(format.notes === null ? {} : { notes: format.notes }),
      ...(format.metadata === null ? {} : { metadata: format.metadata }),
    };
  });

  const revision = Number(campaign.revision);
  if (!Number.isSafeInteger(revision) || revision < 1) throw new Error("Database returned an invalid campaign revision.");
  const snapshot: CampaignSnapshot = {
    id: campaign.id,
    revision,
    clientName: campaign.client_name,
    campaignName: campaign.name,
    ...(campaign.source_filename === null ? {} : { sourceFilename: campaign.source_filename }),
    sheetName: campaign.sheet_name,
    headerRow: campaign.header_row,
    columnMapping: asColumnMapping(campaign.column_mapping),
    rows,
    formats,
  };
  assertCampaignSnapshot(snapshot);
  return { snapshot, ownerSessionHash: campaign.owner_session_hash };
}

export class PostgresCampaignRepository implements CampaignRepository {
  constructor(private readonly sql: Sql) {}

  async createCampaign(record: StoredCampaign): Promise<void> {
    await this.sql.begin(async (sql) => {
      const { snapshot } = record;
      await sql`
        INSERT INTO briefd_campaigns (
          id, owner_session_hash, name, client_name, source_filename, sheet_name,
          header_row, column_mapping, revision
        ) VALUES (
          ${snapshot.id}, ${record.ownerSessionHash}, ${snapshot.campaignName},
          ${snapshot.clientName}, ${snapshot.sourceFilename ?? null}, ${snapshot.sheetName},
          ${snapshot.headerRow}, ${sql.json(snapshot.columnMapping)}, ${snapshot.revision}
        )
      `;
      await insertSnapshotRows(sql, snapshot);
    });
  }

  async findCampaign(id: string): Promise<StoredCampaign | null> {
    return this.sql.begin("isolation level repeatable read read only", (sql) => readCampaign(sql, id));
  }

  async replaceCampaign(record: StoredCampaign, expectedRevision: number, now: string) {
    return this.sql.begin(async (sql) => {
      const { snapshot } = record;
      const locked = await sql<{ id: string; revision: number | string }[]>`
        SELECT id, revision
          FROM briefd_campaigns
         WHERE id = ${snapshot.id}
           AND owner_session_hash = ${record.ownerSessionHash}
         FOR UPDATE
      `;
      if (!locked[0] || Number(locked[0].revision) !== expectedRevision) return "revision-conflict" as const;

      if (unresolvedRowIds(snapshot).length > 0) {
        const activeShares = await sql<{ exists: boolean }[]>`
          SELECT EXISTS (
            SELECT 1
              FROM briefd_share_tokens
             WHERE campaign_id = ${snapshot.id}
               AND revoked_at IS NULL
               AND (expires_at IS NULL OR expires_at > ${now})
          ) AS exists
        `;
        if (activeShares[0]?.exists) return "active-share-conflict" as const;
      }

      const updated = await sql<{ id: string }[]>`
        UPDATE briefd_campaigns
           SET name = ${snapshot.campaignName},
               client_name = ${snapshot.clientName},
               source_filename = ${snapshot.sourceFilename ?? null},
               sheet_name = ${snapshot.sheetName},
               header_row = ${snapshot.headerRow},
               column_mapping = ${sql.json(snapshot.columnMapping)},
               revision = ${snapshot.revision},
               updated_at = NOW()
         WHERE id = ${snapshot.id}
           AND owner_session_hash = ${record.ownerSessionHash}
           AND revision = ${expectedRevision}
        RETURNING id
      `;
      if (updated.length === 0) return "revision-conflict" as const;

      await sql`DELETE FROM briefd_campaign_rows WHERE campaign_id = ${snapshot.id}`;
      await insertSnapshotRows(sql, snapshot);
      return "replaced" as const;
    });
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.sql`DELETE FROM briefd_campaigns WHERE id = ${id}`;
  }

  async listShares(campaignId: string): Promise<StoredShare[]> {
    const rows = await this.sql<ShareDatabaseRow[]>`
      SELECT id, campaign_id, token_hash, created_at, expires_at, revoked_at
        FROM briefd_share_tokens
       WHERE campaign_id = ${campaignId}
       ORDER BY created_at ASC, id ASC
    `;
    return rows.map(storedShare);
  }

  async createShare(share: StoredShare, now: string) {
    return this.sql.begin(async (sql) => {
      const locked = await sql<{ id: string }[]>`
        SELECT id
          FROM briefd_campaigns
         WHERE id = ${share.campaignId}
         FOR UPDATE
      `;
      if (!locked[0]) return "campaign-not-found" as const;

      const expiresAt = share.expiresAt ? Date.parse(share.expiresAt) : null;
      const shareIsActive = !share.revokedAt && (expiresAt === null || expiresAt > Date.parse(now));
      if (shareIsActive) {
        const unresolved = await sql<{ exists: boolean }[]>`
          SELECT EXISTS (
            SELECT 1
              FROM briefd_campaign_rows AS r
              LEFT JOIN briefd_resolved_formats AS f ON f.campaign_row_id = r.id
             WHERE r.campaign_id = ${share.campaignId}
               AND f.id IS NULL
          ) AS exists
        `;
        if (unresolved[0]?.exists) return "campaign-unresolved" as const;
      }

      await sql`
        INSERT INTO briefd_share_tokens (
          id, campaign_id, token_hash, created_at, expires_at, revoked_at
        ) VALUES (
          ${share.id}, ${share.campaignId}, ${share.tokenHash}, ${share.createdAt},
          ${share.expiresAt}, ${share.revokedAt}
        )
      `;
      return "created" as const;
    });
  }

  async findShareByTokenHash(tokenHash: string): Promise<StoredShare | null> {
    const rows = await this.sql<ShareDatabaseRow[]>`
      SELECT id, campaign_id, token_hash, created_at, expires_at, revoked_at
        FROM briefd_share_tokens
       WHERE token_hash = ${tokenHash}
    `;
    return rows[0] ? storedShare(rows[0]) : null;
  }

  async revokeShare(campaignId: string, shareId: string, revokedAt: string): Promise<boolean> {
    const rows = await this.sql<{ id: string }[]>`
      UPDATE briefd_share_tokens
         SET revoked_at = ${revokedAt}
       WHERE campaign_id = ${campaignId}
         AND id = ${shareId}
         AND revoked_at IS NULL
      RETURNING id
    `;
    return rows.length === 1;
  }
}

interface PersistenceSingleton {
  connectionString: string;
  service: CampaignService;
}

const persistenceGlobal = globalThis as typeof globalThis & {
  __briefdPersistence?: PersistenceSingleton;
};

export function campaignService(): CampaignService {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error("DATABASE_URL is required for Briefd persistence.");
  if (persistenceGlobal.__briefdPersistence?.connectionString === connectionString) {
    return persistenceGlobal.__briefdPersistence.service;
  }

  const sql = postgres(connectionString, { max: 10, idle_timeout: 20, connect_timeout: 10 });
  const service = new CampaignService(new PostgresCampaignRepository(sql));
  persistenceGlobal.__briefdPersistence = { connectionString, service };
  return service;
}
