import * as React from 'react'
import { useEffect, useState } from 'react'
import { TextField, Button, Grid, Box, Dialog, useMediaQuery, DialogTitle, DialogContent, Alert } from '@mui/material'
import { PiletApi } from 'consolid-shell'
import { v4 } from 'uuid'
import { createDpopHeader, generateDpopKeyPair, buildAuthenticatedFetch } from '@inrupt/solid-client-authn-core';
import Cookies from 'universal-cookie';
import jwt_decode from 'jwt-decode'
const cookies = new Cookies()

async function generateAccessToken(email: string, password: string, idp: string): Promise<any> {
    if (!idp.endsWith("/")) idp += '/'
    const response = await fetch(`${idp}idp/credentials/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, name: v4() }),
    });

    const { id, secret } = await response.json();
    const tokenUrl = `${idp}.oidc/token`;
    const authString = `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`;
    const dpopKey = await generateDpopKeyPair();
    const r = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
            'content-type': 'application/x-www-form-urlencoded',
            // dpop: await createDpopHeader(tokenUrl, 'POST', dpopKey),
        },
        body: 'grant_type=client_credentials&scope=webid',
    });
    const { access_token } = await r.json();
    return { token: access_token, dpop: dpopKey }
}


const App = ({ piral }: { piral: PiletApi }) => {
    const [oidcIssuer, setOidcIssuer] = useState("http://localhost:3000");
    const [email, setEmail] = useState("jeroen@example.org");
    const [password, setPassword] = useState("test123");
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(undefined)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    // check if logged in at initialisation
    useEffect(() => {
        let token = cookies.get('access_token')
        if (token && token !== "undefined") {
            const loggedIn = jwt_decode<any>(token).webid
            setIsLoggedIn(loggedIn)
        } else {
            setIsLoggedIn(false)
        }
    }, [])

    const onLoginClick = async (e) => {
        try {
            setLoading(e => true)
            console.log("logging in")
            const { token } = await generateAccessToken(email, password, oidcIssuer)
            cookies.set("access_token", token)
            piral.setData('http://localhost:5000/jeroen/access_token', token)
            if (token) setIsLoggedIn(jwt_decode<any>(cookies.get('access_token')).webid)
            else setIsLoggedIn(false)
            setLoading(e => false)
        } catch (error) {
            setError(error.message)
            setLoading(e => false)
        }
    };

    const onLogoutClick = async (e) => {
        try {
            setLoading(e => true)
            cookies.set("access_token", undefined)
            piral.setData('access_token', undefined)
            setIsLoggedIn(false)
            setLoading(e => false)
        } catch (error) {
            setError(error.message)
            setLoading(e => false)
        }
    };

    return (
        <div style={{ alignContent: "center", padding: 30, alignItems: "center", justifyContent: "center", marginTop: "100px", textAlign: "center" }}>
            {(!isLoggedIn) ? (
                <div>
                    <h1 style={{ marginBottom: "30px" }}>Log in wth Solid</h1>
                    <TextField
                        style={inputStyle}
                        id="oidcIssuer"
                        label="Solid Identity Provider"
                        placeholder="Identity Provider"
                        defaultValue={oidcIssuer}
                        onChange={(e) => setOidcIssuer(e.target.value)}
                        autoFocus
                        fullWidth
                    />
                    <TextField
                        style={inputStyle}
                        id="email"
                        label="Email"
                        placeholder="Email"
                        defaultValue={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        style={inputStyle}
                        id="password"
                        label="Password"
                        placeholder="Password"
                        defaultValue={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                        type="password"
                        fullWidth
                    />

                    <Button style={buttonStyle} onClick={onLoginClick} disabled={loading} variant="contained" color="primary">
                        Log In
                    </Button>
                    {(error) ? (
                        <Alert style={{ margin: 5 }} onClose={() => setError("")} severity="error">{error}</Alert>
                    ) : (
                        <></>
                    )}
                </div>
            ) : (
                <div>
                    <h1 style={{ marginBottom: "30px" }}>Log out</h1>
                    <Button style={buttonStyle} onClick={onLogoutClick} disabled={loading} variant="contained" color="primary">
                        Log out
                    </Button>
                </div>
                )}
        </div>
    )
}

const inputStyle = {
    marginTop: 15
}

const buttonStyle = {
    display: "flex",
    marginTop: 15,
    width: "100%"
}

export default App