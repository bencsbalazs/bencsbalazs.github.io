const styleSheets = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/css/all.min.css"
]
const scripts = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js",
    "https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"
]

function loadJQuery() {
    const script = document.createElement('script');
    script.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js";
    document.head.appendChild(script);
    // Wait for jQuery to load before executing code
    script.onload = function () {
        $(document).ready(function () {
            $.each(styleSheets, (i,e)=>{
                $("<link/>", {
                    rel: "stylesheet",
                    type: "text/css",
                    href: e
                }).appendTo("head")
            })
            $.each(scripts, (i, e) => {
                $("<script/>", {
                    src: e
                }).appendTo("head")
            })
            $("main")
                .before($("<header/>", {
                    style:"opacity:.7;",
                    html: $('<div class="px-3 py-2 bg-dark text-white">').append(
                        $('<div class="container">').append(
                            $('<div class="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">').append(
                                $('<a href="/" class="d-flex align-items-center my-2 my-lg-0 text-white text-decoration-none">').append(
                                    '<i class="fa-solid fa-b"></i>',
                                    '<span class="mx-3">Balázs Bencs</span>'
                                ),
                                $('<ul class="nav col-12 col-lg-auto my-2 justify-content-center my-md-0 text-small">').append(
                                    $('<li>').append(
                                        $('<a href="/" class="nav-link text-secondary">').append(
                                            '<i class="fa-solid fa-house"></i>',
                                            '<span class="mx-1">Home</span>'
                                        )
                                    ),
                                    $('<li>').append(
                                        $('<a href="/app" class="nav-link text-white">').append(
                                            '<i class="fa-solid fa-tablet-screen-button"></i>',
                                            '<span class="mx-1">Other apps</span>'
                                        )
                                    ),
                                    $('<li>').append(
                                        $('<a href="/#cv" class="nav-link text-white">').append(
                                            '<i class="fa-regular fa-file"></i>',
                                            '<span class="mx-1">CV</span>'
                                        )
                                    )
                                )
                            )
                        )
                    )
                }))
                .after($("<footer/>", {
                    class: "container-fluid text-center p-2 mt-2 bg-dark text-white",
                    html: `&copy; Balázs Bencs 2009-${new Date().getFullYear()}`
                }))
                .before($("<a/>", {
                    href: "https://github.com/bencsbalazs",
                    html: $("<img/>", {
                        src: "/assets/img/forkme.webp",
                        style: "position: fixed; top: 0; right: 0;",
                    })
                }))
        });
    };
}
loadJQuery();
