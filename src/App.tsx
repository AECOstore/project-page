import * as React from 'react'
import { useEffect, useState } from 'react'
import { TextField, Button, Grid, Box, useMediaQuery, DialogTitle, DialogContent, Alert, Typography } from '@mui/material'
import { PiletApi } from 'consolid-shell'
import ProjectCard from './ProjectCard'
import {QueryEngine} from '@comunica/query-sparql'
import ProjectDialog from './ProjectCreation'


const App = ({ piral }: { piral: PiletApi }) => {
    const constants = piral.getData("CONSTANTS")
    const [session, setSession] = React.useState(piral.makeSession())
    const [projects, setProjects] = React.useState([])
    const [open, setOpen] = React.useState(false)

    async function getMyProjects() {
        const source = await piral.findSparqlSatellite(session.info.webId)
        const query = `select ?project where {
            ?project a <https://w3id.org/consolid#Project> .
        }`

        const data = await piral.querySatellite(query, source).then(i => i.json())
        const projs = data.results.bindings.map(i => i.project.value)
        
        setProjects(projs)
    }

    return (
        <div>
            <h1>ConSolid projects</h1>
            {(session && session.info.isLoggedIn) ? (
                <div>
                    <Typography>You are logged in. Select one of your own projects, load one from a public aggregator or create a new project.</Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={async () => getMyProjects()}
                        style={{ margin: 5}}
                    >
                        Get my projects
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={async () => setOpen(true)}
                        style={{ margin: 5 }}
                    >
                        New Project
                    </Button>
                    <Box>
                        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        {projects.map((item) => {
                            return (
                                <Grid item key={item}>
                                <ProjectCard
                                   
                                    project={item}
                                    piral={piral}
                                />
                                </Grid>
                            );
                        })}
                        </Grid>
                    </Box>
                </div>
            ) : (
                <div>
                    <Typography>You are not logged in. You cannot create a project, but you can load one from a public aggregator.</Typography>
                </div>
            )}
            {open ? (
                <ProjectDialog onClose={() => setOpen(false)} open piral={piral}/>
            ) : (
                <></>
            )}
            {/* get my projects OR public aggregator*/}
            {/* activate a project */}
            {/* create new project */}
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