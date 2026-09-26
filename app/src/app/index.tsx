// Camera-first home screen: OPEN APP -> CAMERA -> SCAN -> RESULT.
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { inferenceMode, scan } from '../model/engine';
import { setLastScan } from '../ui/state';
import { he } from '../ui/strings';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!permission) return <View style={styles.fill} />;
  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.fill, styles.center, styles.pad]}>
        <Text style={styles.title}>{he.permissionTitle}</Text>
        <Text style={styles.body}>{he.permissionBody}</Text>
        <Pressable accessibilityRole="button" style={styles.primary} onPress={requestPermission}>
          <Text style={styles.primaryText}>{he.permissionButton}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const onScan = async () => {
    if (busy || !camera.current) return;
    if (!inferenceMode()) { setError(he.noEngine); return; }
    setBusy(true);
    setError(null);
    try {
      const photo = await camera.current.takePictureAsync({ quality: 0.9, shutterSound: false });
      const output = await scan(photo.uri);
      setLastScan({ output, photoUri: photo.uri });
      router.push('/result');
    } catch {
      setError(he.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.fill}>
      <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" />
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.hintBox}><Text style={styles.hint}>{he.cameraHint}</Text></View>
        <View style={styles.frame} pointerEvents="none" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable accessibilityRole="button" accessibilityLabel={he.scan} onPress={onScan} disabled={busy}
                   style={({ pressed }) => [styles.shutter, pressed && { opacity: 0.7 }]}>
          {busy ? <ActivityIndicator color="#1d1d1b" /> : <View style={styles.shutterInner} />}
        </Pressable>
        <Text style={styles.small}>{busy ? he.analyzing : he.visualOnlyBanner}</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  center: { alignItems: 'center', justifyContent: 'center' },
  pad: { padding: 24, backgroundColor: '#FAFAF7' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  body: { fontSize: 16, textAlign: 'center', marginBottom: 24, color: '#444' },
  primary: { backgroundColor: '#2f7d4f', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  hintBox: { backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  hint: { color: '#fff', fontSize: 16 },
  frame: { width: '72%', aspectRatio: 1, borderRadius: 24, borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)' },
  error: { color: '#fff', backgroundColor: 'rgba(180,30,30,0.85)', padding: 10, borderRadius: 10 },
  shutter: { width: 78, height: 78, borderRadius: 39, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#1d1d1b' },
  small: { color: '#ddd', fontSize: 13 },
});
