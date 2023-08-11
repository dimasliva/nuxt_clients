

export function useScroll(refDt: Ref<any>) {

    let isVisible = useElementVisibility(refDt);
    let scrollY = 0;
    let scrollX = 0;

    const restoreScrolls = () => {
        if (refDt.value) {
            let el = refDt.value.$el.children[0];
            el.scroll(scrollX, scrollY);
        }
    }
    
    
    const scrollTo = (x: number, y: number) => {
        if (refDt.value) {
            let el = refDt.value.$el.children[0];
            el.scroll(x, y);
        }
    }

    
    watch(isVisible, () => {
        //костыль c прокруткой. Если вешать onscroll на другие элементы, то событие не вызывается
        if (isVisible.value) {
            let el = refDt.value.$el.children[0];
            el.onscrollend = (e) => {
                scrollY = el.scrollTop;
                scrollX = el.scrollLeft;
                //console.log(scrollX+" "+scrollY);
            }
            restoreScrolls();
        }
    });

    return {scrollTo,restoreScrolls}
}