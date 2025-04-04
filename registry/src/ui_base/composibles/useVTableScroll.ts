

export function useVTableScroll(refDt: Ref<any>) {

    let isVisible = useElementVisibility(refDt);
    let scrollY = 0;
    let scrollX = 0;


    const getElement = () => {
        let childrenArr = Array.from(refDt.value.$el.children) as any[];
        return childrenArr.find(item => item.className.includes("v-table"));
    }

    const restoreScrolls = () => {
        if (refDt.value) {
            let el = getElement();
            el.scroll(scrollX, scrollY);
        }
    }


    const scrollTo = (x: number, y: number) => {
        if (refDt.value) {
            let el = getElement();
            el.scroll(x, y);
        }
    }


    const getCurrScrollPos = () => {
        if (refDt.value) {
            let el = getElement();
            if (el) {
                scrollY = el.scrollTop;
                scrollX = el.scrollLeft;
                return { scrollTop: el.scrollTop, scrollLeft: el.scrollLeft }
            }
        }
        return null;
    }


    watch(isVisible, () => {
        if (refDt.value) {
            restoreScrolls();
        }
    });


    watch(refDt, () => {
        //костыль c прокруткой. Если вешать onscroll на другие элементы, то событие не вызывается
        if (refDt.value) {
            let el = getElement();
            if (el) {
                el.onscrollend = (e) => {
                    scrollY = el.scrollTop;
                    scrollX = el.scrollLeft;
                }
            }
        }
    });




    return { scrollTo, restoreScrolls, getCurrScrollPos }
}