import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { FieldDailyLog, FieldEntry } from "./types";
import { formatShort } from "../date-utils";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 10, fontFamily: "Helvetica", color: "#1A0572" },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 11, color: "#4B5563", marginBottom: 14 },
  headerCard: {
    borderWidth: 1,
    borderColor: "#1A0572",
    borderRadius: 4,
    padding: 10,
    marginBottom: 14,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  headerRowSpaced: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#E4E6EB" },
  headerCol: { flexGrow: 1 },
  headerLabel: { fontSize: 8, color: "#6B7280", textTransform: "uppercase", marginBottom: 2 },
  headerValue: { fontSize: 12, fontWeight: 700 },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginBottom: 8, marginTop: 4 },
  ptGroup: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 4, padding: 8, marginBottom: 10 },
  ptGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 3,
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  ptGroupTitle: { fontSize: 11, fontWeight: 700, color: "#1A0572" },
  ptGroupMeta: { fontSize: 9, color: "#4B5563" },
  entry: { borderBottomWidth: 1, borderBottomColor: "#E4E6EB", paddingBottom: 8, marginBottom: 8 },
  entryHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  entryName: { fontSize: 10.5, fontWeight: 700 },
  entryMeta: { fontSize: 9, color: "#6B7280" },
  entryObs: { fontSize: 10, marginBottom: 3, lineHeight: 1.4 },
  ocorrencia: { fontSize: 9.5, color: "#B91C1C", fontWeight: 700, marginBottom: 3 },
  photosRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  photo: { width: 110, height: 110, borderRadius: 3, objectFit: "cover" },
  empty: { fontSize: 10, color: "#6B7280", fontStyle: "italic" },
  footer: { position: "absolute", bottom: 20, left: 28, right: 28, fontSize: 8, color: "#9CA3AF", textAlign: "center" },
});

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

interface PtGroup {
  ptNumero: string;
  ptHorario: string | null;
  entries: FieldEntry[];
}

/** Several PTs can be released on the same day for different frentes de serviço — grouping keeps each one's activities together instead of one long interleaved list. */
function groupByPt(entries: FieldEntry[]): PtGroup[] {
  const order: string[] = [];
  const groups = new Map<string, PtGroup>();
  for (const entry of entries) {
    const key = entry.ptNumero || "—";
    if (!groups.has(key)) {
      order.push(key);
      groups.set(key, { ptNumero: entry.ptNumero, ptHorario: entry.ptHorario, entries: [] });
    }
    groups.get(key)!.entries.push(entry);
  }
  return order.map((key) => groups.get(key)!);
}

export default function DailyReportDocument({
  tankTag,
  date,
  dailyLog,
  entries,
}: {
  tankTag: string;
  date: string;
  dailyLog: FieldDailyLog | null;
  entries: FieldEntry[];
}) {
  const groups = groupByPt(entries);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Relatório Diário de Campo</Text>
        <Text style={styles.subtitle}>
          {tankTag} · {formatShort(date)}
        </Text>

        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerCol}>
              <Text style={styles.headerLabel}>Liberação de PET — Horário 1</Text>
              <Text style={styles.headerValue}>{dailyLog?.petHorario1 || "—"}</Text>
            </View>
            <View style={styles.headerCol}>
              <Text style={styles.headerLabel}>Liberação de PET — Horário 2</Text>
              <Text style={styles.headerValue}>{dailyLog?.petHorario2 || "—"}</Text>
            </View>
          </View>
          <View style={styles.headerRowSpaced}>
            <View style={styles.headerCol}>
              <Text style={styles.headerLabel}>Efetivo</Text>
              <Text style={styles.headerValue}>{dailyLog?.efetivo || "—"}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Frentes de serviço ({groups.length}) · {entries.length} registro{entries.length === 1 ? "" : "s"}
        </Text>

        {groups.length === 0 ? (
          <Text style={styles.empty}>Nenhuma atividade registrada neste dia.</Text>
        ) : (
          groups.map((group) => (
            <View key={group.ptNumero || "sem-pt"} style={styles.ptGroup} wrap={false}>
              <View style={styles.ptGroupHeader}>
                <Text style={styles.ptGroupTitle}>{group.ptNumero || "Sem número de PT"}</Text>
                {group.ptHorario && <Text style={styles.ptGroupMeta}>Liberada às {group.ptHorario}</Text>}
              </View>
              {group.entries.map((entry) => (
                <View key={entry.id} style={styles.entry}>
                  <View style={styles.entryHeaderRow}>
                    <Text style={styles.entryName}>{entry.activityName}</Text>
                    <Text style={styles.entryMeta}>
                      {entry.userName} · {formatDateTime(entry.createdAt)}
                    </Text>
                  </View>
                  {entry.ocorrencia && <Text style={styles.ocorrencia}>⚠ Ocorrência de segurança/qualidade</Text>}
                  {entry.observacao && <Text style={styles.entryObs}>{entry.observacao}</Text>}
                  {entry.photos.length > 0 && (
                    <View style={styles.photosRow}>
                      {entry.photos.map((url) => (
                        <Image key={url} src={url} style={styles.photo} />
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))
        )}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `Shutdown Control · Brava Energia — página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
