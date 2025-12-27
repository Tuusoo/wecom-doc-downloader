// 等待DOM加载完成
document.addEventListener("DOMContentLoaded", function () {
    // 获取所有可展开的行
    const expandableRows = document.querySelectorAll(".docgenTable-row--expandable");

    expandableRows.forEach(row => {
        // 获取第一个td子元素
        const firstTd = row.querySelector("td:first-child");
        
        if (firstTd) {
            // 获取i标签
            const iTag = firstTd.querySelector("i");
            
            if (iTag) {
                // 创建三角图标元素
                const triangleIcon = document.createElement("span");
                triangleIcon.className = "docgenTable-toggle";
                
                // 设置三角图标样式
                triangleIcon.style.display = "inline-block";
                triangleIcon.style.width = "0";
                triangleIcon.style.height = "0";
                triangleIcon.style.borderLeft = "6px solid transparent";
                triangleIcon.style.borderRight = "6px solid transparent";
                triangleIcon.style.borderTop = "10px solid #666";
                triangleIcon.style.cursor = "pointer";
                triangleIcon.style.transition = "transform 0.2s ease";
                triangleIcon.style.transform = "rotate(0deg)";
                triangleIcon.style.marginLeft = "8px";
                
                // 替换i标签
                firstTd.replaceChild(triangleIcon, iTag);
                
                // 添加点击事件
                triangleIcon.addEventListener("click", function (e) {
                    e.stopPropagation();

                    // 获取下一行（包含详细内容的行）
                    const nextRow = row.nextElementSibling;

                    if (nextRow && nextRow.querySelector('td[colspan="4"]')) {
                        // 切换显示状态
                        const isHidden = nextRow.style.display === "none";
                        nextRow.style.display = isHidden ? "table-row" : "none";

                        // 旋转图标
                        triangleIcon.style.transform = isHidden ? "rotate(0deg)" : "rotate(-90deg)";

                        // 添加或移除collapsed类
                        if (isHidden) {
                            row.classList.remove("collapsed");
                        } else {
                            row.classList.add("collapsed");
                        }
                    }
                });
            }
        }
    });
});