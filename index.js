const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// A cada 5 minutos apaga salas de HYPE e salas secretas vencidas (com todo o conteúdo).
exports.cleanup = onSchedule('every 5 minutes', async () => {
  const now = admin.firestore.Timestamp.now();
  for (const col of ['rooms', 'secret']) {
    const q = await db.collection(col).where('expiresAt', '<', now).get();
    for (const d of q.docs) await db.recursiveDelete(d.ref);
  }
});

// Excluir a sala de HYPE antes do prazo: SÓ o dono.
exports.deleteRoom = onCall(async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Faça login');
  const ref = db.doc('rooms/' + req.data.id);
  const s = await ref.get();
  if (!s.exists) throw new HttpsError('not-found', 'Sala não encontrada');
  if (s.get('owner') !== req.auth.uid) throw new HttpsError('permission-denied', 'Só o dono da sala pode excluir');
  await db.recursiveDelete(ref);
  return { ok: true };
});

// Estende a sala secreta em +24h. Só o criador.
exports.extendSecret = onCall(async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Faça login');
  const ref = db.doc('secret/' + req.data.id);
  const s = await ref.get();
  if (!s.exists) throw new HttpsError('not-found', 'Sala não encontrada');
  if (s.get('owner') !== req.auth.uid) throw new HttpsError('permission-denied', 'Só quem criou a sala');
  // TODO (antes de publicar): validar o purchaseToken do Google Play Billing
  // com a Google Play Developer API. Sem isso, qualquer criador estende de graça.
  const base = Math.max(s.get('expiresAt').toMillis(), Date.now());
  await ref.update({ expiresAt: admin.firestore.Timestamp.fromMillis(base + 24 * 3600 * 1000) });
  return { ok: true };
});
