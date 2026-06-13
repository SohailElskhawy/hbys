import React from 'react'

const Login = () => {
    // keep track of the email & password values 
    // use the email & password values as an argument for the login() for auth
    // check if the login page leads to 'dashboard' page after login in 
    // check if token has been saved in the localstorage after the login (try to reload the page)


    return (
        <div className="w1">


            <h1>HBYS</h1>
            <h1>login page</h1>
            <form action="" method="post">
                <input type="email" />
                <input type="password" />
                <input type="submit" value='Giris Yap' />
                <a href="">Sifremi Unuttum</a>
                <label>
                    <input type="checkbox" id="" />
                    Beni Hatirla
                </label>
                <a href="">Hesabiniz mi yok? Admin ile iletisim..</a>
            </form>

        </div>
    )
}

export default Login