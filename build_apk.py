import os
import sys
import subprocess

base_dir = os.path.dirname(os.path.abspath(__file__))
android_dir = os.path.join(base_dir, "android")
sdk_dir = r"C:\Users\HP\AppData\Local\Android\Sdk"
java_home = r"C:\Program Files\Java\jdk-23"

env = os.environ.copy()
env["JAVA_HOME"] = java_home
env["ANDROID_HOME"] = sdk_dir
env["ANDROID_SDK_ROOT"] = sdk_dir
env["PATH"] = f"{java_home}\\bin;{sdk_dir}\\platform-tools;{sdk_dir}\\cmdline-tools\\latest\\bin;" + env.get("PATH", "")

gradlew_bat = os.path.join(android_dir, "gradlew.bat")

print("========================================")
print("GreenPulse Android APK Builder")
print("========================================")
print(f"Android Dir: {android_dir}")
print(f"SDK Dir:     {sdk_dir}")
print(f"JAVA_HOME:   {java_home}")
print("========================================\n")

def run_gradle(target):
    print(f"--> Running: gradlew {target} ...")
    result = subprocess.run([gradlew_bat, target, "--stacktrace"], cwd=android_dir, env=env)
    if result.returncode != 0:
        print(f"ERROR: Gradle {target} failed with exit code {result.returncode}")
        sys.exit(result.returncode)
    print(f"SUCCESS: {target} completed successfully!\n")

# 1. Build debug APK
run_gradle("assembleDebug")

# 2. Build release APK
run_gradle("assembleRelease")

debug_apk = os.path.join(android_dir, "app", "build", "outputs", "apk", "debug", "app-debug.apk")
release_apk = os.path.join(android_dir, "app", "build", "outputs", "apk", "release", "app-release.apk")

print("========================================")
print("BUILD SUMMARY:")
print("========================================")
if os.path.exists(debug_apk):
    size_mb = os.path.getsize(debug_apk) / (1024 * 1024)
    print(f"[OK] Debug APK:   {debug_apk} ({size_mb:.2f} MB)")
else:
    print(f"[ERROR] Debug APK missing at: {debug_apk}")

if os.path.exists(release_apk):
    size_mb = os.path.getsize(release_apk) / (1024 * 1024)
    print(f"[OK] Release APK: {release_apk} ({size_mb:.2f} MB)")
else:
    print(f"[ERROR] Release APK missing at: {release_apk}")
print("========================================")
