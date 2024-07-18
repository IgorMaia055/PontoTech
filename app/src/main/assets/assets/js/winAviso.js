    document.querySelector('.loading').hidden = true

    let viewportWidth = window.innerWidth;
    if (viewportWidth >= 600) {
        edit()
    } else {
        edit(false)
    }

    function edit(tf = true) {
        if (tf) {
            document.querySelector('.avisoTel').hidden = false
            document.getElementById('nav').hidden = true
            document.body.style.overflow = 'hidden'
        } else {
            document.querySelector('.avisoTel').hidden = true
            document.getElementById('nav').hidden = false
            document.body.style.overflow = 'flex'
        }
    }