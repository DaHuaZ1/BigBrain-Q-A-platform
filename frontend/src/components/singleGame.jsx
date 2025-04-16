import React from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";

const SingleGame = () => {
    return (
        <Container maxWidth="sm" sx={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Box
              component="form"
              sx={{
                width: '100%',
                maxWidth: { xs: 360, sm: 500, md: 800 },
                mx: 'auto',
                p: { xs: 2, sm: 3 },
                boxShadow: 3,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                backgroundColor: 'background.paper',
                minHeight: 'auto',
              }}
            >
              <Typography variant="h5" gutterBottom>
                Edit Game
              </Typography>

              <TextField
                label="Game Title"
                id="outlined-required"
              />
              <TextField
                label="Thumbnail(URL)"
                id="outlined-required"
              />
              <Button variant="contained">
                Save Changes
              </Button>
            </Box>
          </Container>
    );
}

export default SingleGame;