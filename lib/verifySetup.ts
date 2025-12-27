/**
 * Quick verification script to test Firebase and Gemini setup
 * Run this after configuring your .env.local file
 */

import { db, storage } from './firebase';
import { geminiProModel } from './gemini';
import { collection, getDocs } from 'firebase/firestore';
import { ref } from 'firebase/storage';

export async function verifySetup() {
  const results = {
    firebase: false,
    firestore: false,
    storage: false,
    gemini: false,
    errors: [] as string[],
  };

  // Test Firebase initialization
  try {
    if (db) {
      results.firebase = true;
      console.log('✅ Firebase initialized successfully');
    }
  } catch (error) {
    results.errors.push(`Firebase init error: ${error}`);
    console.error('❌ Firebase initialization failed:', error);
  }

  // Test Firestore connection
  try {
    const testCollection = collection(db, 'test');
    await getDocs(testCollection);
    results.firestore = true;
    console.log('✅ Firestore connected successfully');
  } catch (error) {
    results.errors.push(`Firestore error: ${error}`);
    console.error('❌ Firestore connection failed:', error);
  }

  // Test Storage connection
  try {
    const testRef = ref(storage, 'test.txt');
    if (testRef) {
      results.storage = true;
      console.log('✅ Firebase Storage connected successfully');
    }
  } catch (error) {
    results.errors.push(`Storage error: ${error}`);
    console.error('❌ Firebase Storage connection failed:', error);
  }

  // Test Gemini API
  try {
    const result = await geminiProModel.generateContent('Say "Hello" in one word');
    const response = await result.response;
    const text = response.text();
    if (text) {
      results.gemini = true;
      console.log('✅ Gemini API connected successfully');
      console.log(`   Response: ${text.trim()}`);
    }
  } catch (error) {
    results.errors.push(`Gemini error: ${error}`);
    console.error('❌ Gemini API connection failed:', error);
  }

  // Summary
  console.log('\n📊 Setup Verification Summary:');
  console.log('─────────────────────────────');
  console.log(`Firebase:  ${results.firebase ? '✅' : '❌'}`);
  console.log(`Firestore: ${results.firestore ? '✅' : '❌'}`);
  console.log(`Storage:   ${results.storage ? '✅' : '❌'}`);
  console.log(`Gemini:    ${results.gemini ? '✅' : '❌'}`);
  
  if (results.errors.length > 0) {
    console.log('\n⚠️  Errors:');
    results.errors.forEach(err => console.log(`   - ${err}`));
  }

  const allSuccess = results.firebase && results.firestore && results.storage && results.gemini;
  
  if (allSuccess) {
    console.log('\n🎉 All services connected! Ready to build!');
  } else {
    console.log('\n⚠️  Some services failed. Check SETUP_GUIDE.md');
  }

  return results;
}
