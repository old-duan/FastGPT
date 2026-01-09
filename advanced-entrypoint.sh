#!/bin/sh
# FastGPT 高级版启动补丁

echo "🔧 正在应用高级版补丁..."

# 查找并修改编译后的 JS 文件
# 将 isPlus: !!licenseData 替换为 isPlus: true

SYSTEM_FILE="/app/projects/app/.next/server/pages/api/common/system/getInitData.js"
INIT_FILE="/app/.next/server/chunks/*.js"

# 如果文件存在，进行替换
if [ -f "$SYSTEM_FILE" ]; then
    sed -i 's/isPlus:!!e/isPlus:true/g' "$SYSTEM_FILE" || true
    sed -i 's/isPlus:!!\w/isPlus:true/g' "$SYSTEM_FILE" || true
    echo "✓ 已修补 getInitData.js"
fi

# 遍历所有编译文件
find /app/.next/server -name "*.js" -type f -exec grep -l "isPlus" {} \; | while read file; do
    sed -i 's/isPlus:!![a-zA-Z]/isPlus:true/g' "$file" 2>/dev/null || true
done

echo "✓ 高级版补丁应用完成"

# 启动原始命令
exec "$@"
