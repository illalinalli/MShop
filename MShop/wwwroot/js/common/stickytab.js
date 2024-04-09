class StickyTable {
    whole; toprow; restrow;
    stickytab0; stickytab1; stickytab2; stickytab3;
    table0; table1; table2; table3;
    pressed; startX; startY;
    window; fixAt;

    constructor(elem) {
        elem.stickytable = this;
        this.whole = $(elem);
        this.window = $(window);
        this.toprow = this.whole.children(".stickytab_top");
        this.restrow = this.whole.children(".stickytab_rest");
        this.stickytab0 = this.toprow.find(".stickytab0");
        this.stickytab1 = this.toprow.find(".stickytab1");
        this.stickytab2 = this.restrow.find(".stickytab2");
        this.stickytab3 = this.restrow.find(".stickytab3");
        this.table0 = this.stickytab0.find("table");
        this.table1 = this.stickytab1.find("table");
        this.table2 = this.stickytab2.find("table");
        this.table3 = this.stickytab3.find("table");
        this.pressed = false;
        this.startX = 0;
        this.startY = 0;

        this.window
            .resize((event) => { this.windowResize(event); });

        this.stickytab3
            .mousedown((event) => { this.st3mousedown(event); })
            .mousemove((event) => { this.st3mousemove(event); })
            .mouseup((event) => { this.st3mouseup(event); })
            .scroll((event) => { this.st3scroll(event); });

        this.whole.find(".stickytab_copybutton").click(() => { this.copyDataToClipboard(); });

        this.windowResize();
    }

    // tab0, tab1 - jQueried tables.
    alignTables(tab0, tab1) {
        let rows0 = tab0.children("tbody").children("tr");
        let rows1 = tab1.children("tbody").children("tr");
        let rowCount0 = rows0.length;
        let rowCount1 = rows1.length;
        let count = rowCount0 < rowCount1 ? rowCount0 : rowCount1;
        var heights = [];
        heights.length = count;
        for (let i = 0; i < count; i++) {
            let r0 = $(rows0[i]).find("td");
            let r1 = $(rows1[i]).find("td");
            let h0 = r0.height();
            let h1 = r1.height();
            if (h0 < h1) {
                heights[i] = { height: h1, elem: r0 };
            } else if (h0 > h1) {
                heights[i] = { height: h0, elem: r1 };
            } else heights[i] = null; // если одинаково, ничего не надо делать.
        }
        if (count > 20) { tab0.hide(); tab1.hide(); }
        for (let i = 0; i < count; i++) {
            let x = heights[i]; if (!x) continue;
            x.elem.height(x.height);
        }
        if (count > 20) { tab0.show(); tab1.show(); }
    }

    windowResize() {
        let ph = $(".header-placeholder");
        this.fixAt = ph.offset().top + ph.outerHeight();
        this.toprow.css({ top: this.fixAt });
        this.alignTables(this.table0, this.table1);
        this.alignTables(this.table2, this.table3);
    }

    st3mousedown(event) {
        this.startX = this.stickytab3.scrollLeft() + event.clientX;
        this.startY = this.window.scrollTop() + event.clientY;
        this.pressed = true;
    }

    st3mousemove(event) {
        if (!this.pressed) return;

        let left = this.startX - event.clientX;
        this.stickytab1.scrollLeft(left);
        this.stickytab3.scrollLeft(left);
        let top = this.startY - event.clientY;
        this.window.scrollTop(top);
        event.preventDefault();
    }

    st3mouseup() {
        this.pressed = false;
    }
    
    st3scroll() {
        let left = this.stickytab3.scrollLeft();
        this.stickytab1.scrollLeft(left);
    }

    collectFromTables(tab0, tab1) {
        let rows0 = tab0.children("tbody").children("tr");
        let rows1 = tab1.children("tbody").children("tr");
        let rowCount0 = rows0.length;
        let rowCount1 = rows1.length;
        let count = rowCount0 < rowCount1 ? rowCount0 : rowCount1;

        var collected = "";
        for (let i = 0; i < count; i++) {
            let r0 = $(rows0[i]), r1 = $(rows1[i]);
            if (r0.hasClass("do-not-copy") || r1.hasClass("do-not-copy")) continue;
            let line = [];
            let tds = r0.find("td");
            for (let j = 0; j < tds.length; j++) line.push(tds[j].innerText);
            tds = r1.find("td");
            for (let j = 0; j < tds.length; j++) line.push(tds[j].innerText);
            collected += strMerge(line, '\t', '"', false) + "\n";
        }

        return collected;
    }

    copyDataToClipboard() {
        let data = this.collectFromTables(this.table0, this.table1) + this.collectFromTables(this.table2, this.table3);
        setClipboard(data);
    }
}

$(function () {
    $(".stickytable").each(function (index, elem) { new StickyTable(elem) });
});
