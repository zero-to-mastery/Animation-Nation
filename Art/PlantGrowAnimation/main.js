function setup() {
    TweenMax.set("#shadow", {
        scale: 0,
        transformOrigin: "15px 8px"
    });
    TweenMax.set("#tree", {
        scale: 0,
        transformOrigin: "154px bottom"
    });
    TweenMax.set("#leaf-rb", {
        scale: 0,
        rotation: "-60cw",
        y: -15,
        transformOrigin: "left bottom"
    });
    TweenMax.set("#leaf-rm", {
        scale: 0,
        rotation: "-50cw",
        y: 30,
        transformOrigin: "left bottom"
    });
    TweenMax.set("#leaf-lb", {
        scale: 0,
        rotation: "60cw",
        y: -80,
        transformOrigin: "right bottom"
    });
    TweenMax.set("#leaf-lm", {
        scale: 0,
        rotation: "40cw",
        y: -90,
        transformOrigin: "right bottom"
    });

    TweenMax.set("#leaf-top", {
        scale: 0,
        transformOrigin: "center bottom"
    });

    TweenMax.set("#leaf-rb g", {
        scale: 0,
        transformOrigin: "left 60px"
    });
    TweenMax.set("#leaf-rm g", {
        scale: 0,
        transformOrigin: "22px 140px"
    });
    TweenMax.set("#leaf-lb g", {
        scale: 0,
        transformOrigin: "right 56px"
    });
    TweenMax.set("#leaf-lm g", {
        scale: 0,
        transformOrigin: "106px bottom"
    });
}

// This should be called on document.load
function animate() {
    var tl = new TimelineMax({
        delay: 0.42,
        repeat: -1,
        repeatDelay: 2,
        yoyo: true
    });

    tl.to(
        "#shadow",
        2,
        {
            scale: 1
        },
        0
    )
        .to(
            "#tree",
            2,
            {
                scale: 1
            },
            0
        )
        .to(
            "#leaf-rb",
            2,
            {
                scale: 1,
                rotation: "0cw",
                y: 0,
                delay: 0.35
            },
            0
        )
        .to(
            "#leaf-rm",
            2,
            {
                scale: 1,
                rotation: "0cw",
                y: 0,
                delay: 0.35
            },
            0
        )
        .to(
            "#leaf-lb",
            2,
            {
                scale: 1,
                rotation: "0cw",
                y: 0,
                delay: 0.35
            },
            0
        )
        .to(
            "#leaf-lm",
            2,
            {
                scale: 1,
                rotation: "0cw",
                y: 0,
                delay: 0.35
            },
            0
        )
        .to(
            "#leaf-top",
            2.5,
            {
                scale: 1,
                delay: 0.35
            },
            0
        )
        .to(
            "#leaf-lb g",
            2.25,
            {
                scale: 1,
                delay: 0.5
            },
            0
        )
        .to(
            "#leaf-lm g",
            2.25,
            {
                scale: 1,
                delay: 0.6
            },
            0
        )
        .to(
            "#leaf-rb g",
            2.25,
            {
                scale: 1,
                delay: 0.5
            },
            0
        )
        .to(
            "#leaf-rm g",
            2.25,
            {
                scale: 1,
                delay: 0.6
            },
            0
        );

    return tl;
}

function stopAndReset() {
    // TweenMax.killAll(false, true, false);
    TweenMax.set("#tree", { clearProps: "all" });
    TweenMax.set("#shadow", { clearProps: "all" });
    TweenMax.set("#leaf-top", { clearProps: "all" });
    TweenMax.set("#leaf-rb", { clearProps: "all" });
    TweenMax.set("#leaf-rm", { clearProps: "all" });
    TweenMax.set("#leaf-lb", { clearProps: "all" });
    TweenMax.set("#leaf-lm", { clearProps: "all" });
    TweenMax.set("#leaf-top", { clearProps: "all" });
    TweenMax.set("#leaf-rb g", { clearProps: "all" });
    TweenMax.set("#leaf-rm g", { clearProps: "all" });
    TweenMax.set("#leaf-lb g", { clearProps: "all" });
    TweenMax.set("#leaf-lm g", { clearProps: "all" });
}

function playAgain() {
    stopAndReset();
    setup();
    animate();
}

stopAndReset();
setup();
window.onload = animate;
