/**
 * Run this script once to generate VAPID keys for Web Push Notifications.
 * 
 * Usage: node scripts/generate-vapid-keys.js
 * 
 * Then copy the output into your .env file:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<publicKey>
 *   VAPID_PRIVATE_KEY=<privateKey>
 */

const webpush = require('web-push');
const keys = webpush?.generateVAPIDKeys();

console.log('\n=== VAPID Keys Generated ===\n');
console.log('Add these to your .env file:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys?.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys?.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@ssvm.edu.in`);
console.log('\n============================\n');
