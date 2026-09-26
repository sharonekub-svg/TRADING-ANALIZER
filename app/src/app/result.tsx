import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getBundle } from '../model/engine';
import type { HeadResult } from '../model/types';
import { sendFeedback } from '../feedback';
import { CHIP, pct } from '../ui/chips';
import { getLastScan } from '../ui/state';
import { he } from '../ui/strings';

function Chip({ title, head }: { title: string; head: HeadResult | null }) {
  const available = head?.available && head.label;
  const c = CHIP[available ? head!.label! : 'unknown'];
  return (
    <View style={styles.row}>
      <Text style={styles.rowTitle}>{title}</Text>
      <View style={[styles.chip, { backgroundColor: c.bg }]}>
        <Text style={styles.chipText}>{available ? `${c.dot} ${head!.label_he}` : he.notAvailable}</Text>
      </View>
    </View>
  );
}

export default function ResultScreen() {
  const last = getLastScan();
  const [open, setOpen] = useState<'what' | 'why' | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  if (!last) {
    router.replace('/');
    return null;
  }
  const { result: r, top3 } = last.output;
  const onFeedback = async (correct: boolean) => {
    setFeedbackSent(true);
    await sendFeedback({ model_id: getBundle().model_id, status: r.status, produce: r.produce,
                         confidence: r.produce_confidence, correct });
  };

  return (
    <SafeAreaView style={styles.fill}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Image source={{ uri: last.photoUri }} style={styles.photo} accessibilityIgnoresInvertColors />
        {r.status === 'ok' ? (
          <View style={styles.card}>
            <Text style={styles.name}>{r.emoji} {r.produce_he}</Text>
            <Text style={styles.muted}>{he.confidence}: {pct(r.produce_confidence)}</Text>
            <Chip title={he.ripeness} head={r.ripeness} />
            <Chip title={he.freshness} head={r.freshness} />
            <Chip title={he.spoilage} head={r.visual_spoilage} />
            <Text style={styles.rowTitle}>{he.recommendation}</Text>
            <Text style={styles.rec}>{r.recommendation_he}</Text>
          </View>
        ) : (
          <View style={styles.card}><Text style={styles.message}>{r.message_he}</Text></View>
        )}

        <View style={styles.disclaimer} accessibilityRole="alert">
          <Text style={styles.disclaimerText}>ⓘ {r.disclaimer_he}</Text>
        </View>

        <Pressable onPress={() => setOpen(open === 'what' ? null : 'what')}><Text style={styles.link}>▸ {he.whatWeSaw}</Text></Pressable>
        {open === 'what' && top3.map((t) => (
          <Text key={t.produce} style={styles.body}>{t.he} — {pct(t.prob)}</Text>
        ))}
        {r.explanation_he.length > 0 && (
          <Pressable onPress={() => setOpen(open === 'why' ? null : 'why')}><Text style={styles.link}>▸ {he.why}</Text></Pressable>
        )}
        {open === 'why' && r.explanation_he.map((e) => <Text key={e} style={styles.body}>{e}</Text>)}

        {r.status === 'ok' && (
          <View style={styles.feedback}>
            {feedbackSent ? <Text style={styles.muted}>{he.thanks}</Text> : (
              <>
                <Text style={styles.body}>{he.wasItRight}</Text>
                <Pressable style={styles.small} onPress={() => onFeedback(true)}><Text>{he.yes}</Text></Pressable>
                <Pressable style={styles.small} onPress={() => onFeedback(false)}><Text>{he.no}</Text></Pressable>
              </>
            )}
          </View>
        )}

        <Pressable accessibilityRole="button" style={styles.primary} onPress={() => router.back()}>
          <Text style={styles.primaryText}>{he.retake}</Text>
        </Pressable>
        <Link href="/credits" style={styles.footer}>{he.credits} · {he.modelVersion}: {getBundle().model_id}</Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#FAFAF7' },
  pad: { padding: 16, gap: 12 },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: '#E4E4DD' },
  name: { fontSize: 30, fontWeight: '700', textAlign: 'left' },
  muted: { color: '#6b6b66', fontSize: 14, textAlign: 'left' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowTitle: { fontSize: 16, fontWeight: '600', textAlign: 'left' },
  chip: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 15 },
  rec: { fontSize: 20, fontWeight: '600', textAlign: 'left' },
  message: { fontSize: 18, lineHeight: 26, textAlign: 'left' },
  disclaimer: { backgroundColor: '#FFF8E1', borderRadius: 12, padding: 12 },
  disclaimerText: { fontSize: 14, textAlign: 'left' },
  link: { color: '#2f7d4f', fontSize: 16, fontWeight: '600', textAlign: 'left' },
  body: { fontSize: 15, color: '#333', textAlign: 'left' },
  feedback: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  small: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  primary: { backgroundColor: '#2f7d4f', padding: 14, borderRadius: 12, alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  footer: { color: '#6b6b66', fontSize: 12, textAlign: 'center' },
});
