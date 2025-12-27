const frame = document.getElementById("docFrame");
const links = document.querySelectorAll(".ep-doc-select a");

// 页面加载后初始化
window.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".ep-doc-wrap").forEach(wrap => {
        // 仅处理有子级的容器
        const hasChildren = wrap.querySelectorAll(".ep-doc-wrap, .ep-doc-special").length > 0;
        if (hasChildren) {
            const title = wrap.querySelector(".ep-doc-item");
            if (title) {
                wrap.classList.add("collapsed");
                title.addEventListener("click", e => {
                    e.stopPropagation(); // 阻止事件冒泡
                    wrap.classList.toggle("collapsed");
                });
            }
        }
    });
});

// 自动检测ep-doc-item是否包含子元素，并添加has-children类
document.addEventListener("DOMContentLoaded", function () {
    const epDocItems = document.querySelectorAll(".ep-doc-item");
    epDocItems.forEach(function (item) {
        // 获取父级ep-doc-wrap
        const parentWrap = item.closest(".ep-doc-wrap");
        if (parentWrap) {
            // 检查父级wrap中是否有子级wrap（排除当前item本身）
            const childWraps = parentWrap.querySelectorAll(
                ":scope > .ep-doc-wrap, :scope > .ep-doc-special"
            );
            if (childWraps.length > 0) {
                item.classList.add("has-children");
            }
        }
    });
});

links.forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();

        const href = link.getAttribute("href");
        if (!href) return;

        const url = `./docs/${href.split("/")[3]}.html`;

        // 切换 iframe
        frame.src = url;

        // 高亮当前项
        links.forEach(l => l.parentElement.classList.remove("active"));
        link.parentElement.classList.add("active");
    });
});

// 默认加载第一个文档
if (links.length > 0) {
    links[0].click();
}
