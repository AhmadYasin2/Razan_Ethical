# WebGazer Initialization Debugging Guide

## 🔴 Stuck on "Initializing WebGazer..."

Here's how to troubleshoot:

### Step 1: Check Browser Console (F12)

Press **F12** to open developer tools, go to **Console** tab and look for:

#### ✅ What you should see:

```
WebGazer loaded successfully
WebGazer ready - Tracking enabled
Gaze data: {x: 123, y: 456, timestamp: 1234567890}
```

#### ❌ Common errors:

```
Failed to load WebGazer script
Cannot find module 'webgazer.js'
Permission denied for camera access
```

---

### Step 2: Check Camera Permission

1. **Chrome/Edge**:

   - Look for camera icon in address bar
   - Click it → "Allow" camera access
   - Refresh page

2. **Firefox**:

   - Pop-up should appear asking for camera permission
   - Click "Allow"
   - Refresh page

3. **Safari**:
   - Settings → Privacy → Camera
   - Allow your localhost

---

### Step 3: Verify WebGazer File Exists

Check that `/public/WebGazer/dist/webgazer.js` file is present:

```powershell
# In PowerShell
ls "C:\Users\ahmad\Desktop\Razan\public\WebGazer\dist\webgazer.js"
```

Should show file size ~1.7MB (it's large due to bundling)

---

### Step 4: Check Network Tab (F12)

1. Open DevTools (F12)
2. Go to **Network** tab
3. Reload page
4. Look for `webgazer.js` in the list

#### ✅ Should see:

- Status: **200** (or 304 cached)
- Size: ~500KB
- Type: **script**

#### ❌ If you see:

- Status: **404** → File not found
- Status: **403** → Permission denied
- Status: **0** → Network/CORS error

---

### Step 5: Manual Test

Try this in browser console (F12 → Console tab):

```javascript
// Check if file loaded
console.log(window.webgazer);

// Should output something like: {begin: ƒ, pause: ƒ, setGazeListener: ƒ, ...}
// If undefined, webgazer.js didn't load
```

---

## 🛠️ Quick Fixes

### Fix 1: Hard Refresh

```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### Fix 2: Clear Cache

1. DevTools (F12)
2. Right-click refresh button
3. Select "Empty cache and hard refresh"

### Fix 3: Check Port Conflict

```powershell
# Kill process on port 3000 if stuck
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### Fix 4: Rebuild Project

```powershell
cd "C:\Users\ahmad\Desktop\Razan"
npm run build
npm run dev
```

---

## 🚀 Alternative: Quick Test

Try this simpler test component first (no calibration):

```tsx
import { useWebGazer } from "@/tracking/useWebGazer";

export function SimpleTest() {
  const { ready, gazeData } = useWebGazer(true);

  return (
    <div style={{ padding: "20px" }}>
      <h1>{ready ? "✅ WebGazer Ready!" : "⏳ Loading..."}</h1>
      {gazeData && (
        <p>
          Gaze: ({gazeData.x.toFixed(0)}, {gazeData.y.toFixed(0)})
        </p>
      )}
      <p style={{ color: "gray", fontSize: "12px" }}>
        Open console (F12) to see logs
      </p>
    </div>
  );
}
```

Then navigate to `http://localhost:3000/_ux` and see if it works.

---

## 📋 Detailed Checklist

- [ ] Camera permission granted
- [ ] Browser console shows "WebGazer loaded successfully"
- [ ] Network tab shows webgazer.js loaded (200 status)
- [ ] `window.webgazer` exists in console
- [ ] No CORS errors in console
- [ ] No permission errors in console
- [ ] Page refreshed after granting camera access
- [ ] Not using private/incognito mode (some browsers block camera)

---

## 🔍 Deep Debugging

Add this temporary code to `useWebGazer.ts` to see what's happening:

```typescript
useEffect(() => {
  if (!active) return;

  console.log("🔵 useWebGazer: Starting initialization");

  const loadWebGazer = async () => {
    console.log("🟡 Checking if already loaded...");
    const g: any = (window as any).webgazer;
    if (g && g.isReady?.()) {
      console.log("✅ WebGazer already ready");
      setReady(true);
      setupGazeListener(g);
      return;
    }

    console.log("🟡 Loading script from /WebGazer/webgazer.js");
    const script = document.createElement("script");
    script.src = "/WebGazer/webgazer.js";
    script.async = true;

    script.onload = () => {
      console.log("✅ Script loaded, checking window.webgazer");
      const wg: any = (window as any).webgazer;
      if (!wg) {
        console.error(
          "❌ WebGazer failed to load - window.webgazer is undefined"
        );
        return;
      }

      console.log("✅ WebGazer object found:", wg);
      console.log("🔵 Configuring WebGazer...");

      wg.setRegression?.(config?.regression || "ridge");
      wg.setTracker?.(config?.tracker || "clmtrackr");
      wg.showVideoPreview?.(config?.showVideo ?? false);
      wg.showPredictionPoints?.(config?.showPredictionPoints ?? true);

      console.log("🔵 Starting tracking...");
      wg.begin?.();

      console.log("🔵 Setting up gaze listener...");
      setupGazeListener(wg);

      console.log("✅ WebGazer ready!");
      setReady(true);
    };

    script.onerror = () => {
      console.error(
        "❌ Failed to load WebGazer script from /WebGazer/webgazer.js"
      );
    };

    console.log("🔵 Appending script to body");
    document.body.appendChild(script);
  };

  loadWebGazer();

  return () => {
    console.log("🔵 Cleaning up WebGazer");
    try {
      const wg: any = (window as any).webgazer;
      if (wg && gazeListenerRef.current) {
        wg.removeGazeListener?.(gazeListenerRef.current);
      }
      wg?.pause?.();
    } catch (e) {
      console.error("❌ Error cleaning up:", e);
    }
  };
}, [active, config, onGazeUpdate]);
```

Then check the console - you'll see exactly where it's getting stuck.

---

## 📞 Still Stuck?

1. **Check console output** - What's the last log message?
2. **Verify webgazer.js exists** - `ls /public/WebGazer/webgazer.js`
3. **Rebuild and restart** - Sometimes cache issues
4. **Check Network tab** - Is webgazer.js actually being downloaded?
5. **Check camera** - Can other apps access your webcam?

**Share the console output and I can help you fix it!**
