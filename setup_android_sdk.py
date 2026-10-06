import os
import sys
import urllib.request
import zipfile
import subprocess
import shutil

sdk_root = r"C:\Users\HP\AppData\Local\Android\Sdk"
cmdline_dir = os.path.join(sdk_root, "cmdline-tools")
latest_dir = os.path.join(cmdline_dir, "latest")
zip_path = os.path.join(sdk_root, "commandlinetools.zip")

os.makedirs(sdk_root, exist_ok=True)
os.makedirs(cmdline_dir, exist_ok=True)

sdkmanager_bat = os.path.join(latest_dir, "bin", "sdkmanager.bat")

if not os.path.exists(sdkmanager_bat):
    url = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
    print(f"Downloading Android Command Line Tools from {url}...")
    
    def reporthook(blocknum, blocksize, totalsize):
        readsofar = blocknum * blocksize
        if totalsize > 0:
            percent = readsofar * 100 / totalsize
            if blocknum % 500 == 0:
                print(f"Downloaded {readsofar // (1024*1024)}MB / {totalsize // (1024*1024)}MB ({percent:.1f}%)")

    urllib.request.urlretrieve(url, zip_path, reporthook)
    print("Download complete. Extracting...")

    extract_tmp = os.path.join(cmdline_dir, "temp_extract")
    if os.path.exists(extract_tmp):
        shutil.rmtree(extract_tmp)

    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_tmp)

    src_cmdline = os.path.join(extract_tmp, "cmdline-tools")
    if os.path.exists(latest_dir):
        shutil.rmtree(latest_dir)
    
    shutil.move(src_cmdline, latest_dir)
    shutil.rmtree(extract_tmp, ignore_errors=True)
    if os.path.exists(zip_path):
        os.remove(zip_path)
    print("Command Line Tools setup complete at:", latest_dir)
else:
    print("sdkmanager already exists at:", sdkmanager_bat)

java_home = r"C:\Program Files\Java\jdk-23"
env = os.environ.copy()
env["JAVA_HOME"] = java_home
env["ANDROID_HOME"] = sdk_root
env["ANDROID_SDK_ROOT"] = sdk_root
env["PATH"] = f"{os.path.join(latest_dir, 'bin')};{os.path.join(java_home, 'bin')};" + env["PATH"]

# Accept licenses
print("Accepting Android SDK licenses...")
p = subprocess.Popen([sdkmanager_bat, "--sdk_root=" + sdk_root, "--licenses"],
                     stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=env)
stdout, stderr = p.communicate(input="y\ny\ny\ny\ny\ny\ny\ny\ny\ny\ny\ny\n")
print("License acceptance complete.")

# Install platform-tools, build-tools, platforms
packages = ["platform-tools", "build-tools;34.0.0", "platforms;android-34", "platforms;android-35"]
print("Installing SDK packages:", packages)
for pkg in packages:
    print(f"Installing {pkg}...")
    p = subprocess.run([sdkmanager_bat, "--sdk_root=" + sdk_root, pkg], input="y\n", text=True, capture_output=True, env=env)
    print(f"Result for {pkg}: {p.returncode}")

print("Android SDK setup completed successfully!")
