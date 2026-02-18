# 🔧 DEBUGGING: 500 Internal Server Error

## Recent Fixes Applied

I've made two improvements to help identify the issue:

### 1. Added Merchant Null Check
Before creating the invoice, we now explicitly check that the merchant exists.

### 2. Enhanced Error Logging
The API now returns the actual error message in development mode, making it easier to debug.

---

## 🧪 Next Steps to Debug

### Step 1: Check Browser Console for Error Details

After refreshing the dashboard and trying to create an invoice again, you should see more detailed error information in the browser console.

**Look for:**
```json
{
  "error": "Internal server error",
  "details": "The actual error message will be here"
}
```

### Step 2: Check Terminal Output

Look at your terminal where `npm run dev` is running. There should be console.error output showing:
```
Error creating invoice: [Error details]
Error details: [Specific message]
```

Tell me what the error message says!

---

## 🔍 Common Causes of 500 Errors

### 1. Database Connection Issue
**Symptoms:** Can't connect to database
**Fix:** Check if PostgreSQL is running
```bash
docker ps
```
Should show `mnee-postgres` container

### 2. Merchant Not Found
**Symptoms:** "merchant is null" or similar
**Possible causes:**
- Merchant account wasn't created when you connected
- Database connection issue during authentication
**Fix:** Try disconnecting and reconnecting wallet

### 3. Prisma Schema Issue
**Symptoms:** Field doesn't exist errors
**Possible causes:** Database schema doesn't match Prisma schema
**Fix:** 
```bash
npx prisma db push
```

### 4. Type Mismatch
**Symptoms:** "Cannot convert X to Y" errors
**Possible causes:**
- Amount is not a valid number
- expiresInHours is not valid
**Fix:** Check form data being sent

---

## 🆘 What to Do Right Now

1. **Refresh the dashboard page**
   - Open: http://localhost:3000/dashboard

2. **Open Browser DevTools**
   - Press F12
   - Go to "Console" tab

3. **Try creating an invoice again**
   - Fill in:
     - Product Name: "Test"
     - Amount: "100"
   - Click "Create Invoice"

4. **Copy the error message from console**
   - Look for the line that says: `Error response text:`
   - Copy the entire `{"error":...}` object

5. **Share it with me**
   - Tell me exactly what error you see

---

## 📋 Quick Diagnostic

### Is the database running?
```bash
docker ps
```
Should show mnee-postgres

### Can you connect to the database?
```bash
node check-merchant.js
```
Should show your merchant account

### Is the dev server running correctly?
Check terminal for errors

---

## 🎯 Most Likely Issues

Based on the error, the most likely causes are:

1. **Merchant object is null** (we added a check for this)
2. **Database connection lost** (restart PostgreSQL)
3. **Prisma schema mismatch** (run npx prisma db push)
4. **Invalid form data** (check browser console)

---

**Try creating the invoice again and tell me the EXACT error message you see in the browser console!**

That will help me pinpoint the exact issue. 🔍
