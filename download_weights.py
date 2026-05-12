#!/usr/bin/env python3
"""
Download Fashn VTON model weights.
This script can be interrupted and restarted - it will resume where it left off.
"""
import os
import sys
import shutil
from pathlib import Path
from huggingface_hub import hf_hub_download

def main():
    weights_dir = Path(__file__).parent / 'weights'
    weights_dir.mkdir(exist_ok=True)
    
    os.environ['HF_HOME'] = str(weights_dir / '.cache')
    
    print(f"📥 Downloading Fashn VTON weights to {weights_dir}")
    print("   This script is resumable - you can restart if needed\n")
    
    files_to_download = [
        ('fashn-ai/fashn-vton-1.5', 'model.safetensors', 'model.safetensors'),
        ('fashn-ai/DWPose', 'yolox_l.onnx', 'dwpose/yolox_l.onnx'),
        ('fashn-ai/DWPose', 'dw-ll_ucoco_384.onnx', 'dwpose/dw-ll_ucoco_384.onnx'),
    ]
    
    for i, (repo_id, filename, target_path) in enumerate(files_to_download, 1):
        target_file = weights_dir / target_path
        
        # Skip if already exists
        if target_file.exists():
            size_mb = target_file.stat().st_size / (1024*1024)
            print(f"✓ [{i}/3] {target_path}: {size_mb:.1f} MB (already exists)")
            continue
        
        print(f"⏳ [{i}/3] Downloading {filename} from {repo_id}...")
        try:
            result_path = hf_hub_download(
                repo_id=repo_id,
                filename=filename,
                local_dir=str(weights_dir),
                cache_dir=str(weights_dir / '.cache'),
                force_download=False
            )
            size_mb = Path(result_path).stat().st_size / (1024*1024)
            print(f"   ✓ {target_path}: {size_mb:.1f} MB\n")
        except Exception as e:
            print(f"   ✗ Failed: {e}\n")
            return 1
    
    # Final verification
    print("✅ Final verification:")
    all_good = True
    for repo_id, filename, target_path in files_to_download:
        target_file = weights_dir / target_path
        if target_file.exists():
            size_mb = target_file.stat().st_size / (1024*1024)
            print(f"   ✓ {target_path}: {size_mb:.1f} MB")
        else:
            print(f"   ✗ MISSING: {target_path}")
            all_good = False
    
    if all_good:
        print("\n🎉 All weights downloaded successfully!")
        print(f"   Location: {weights_dir}")
        return 0
    else:
        print("\n❌ Some weights are missing")
        return 1

if __name__ == '__main__':
    sys.exit(main())
