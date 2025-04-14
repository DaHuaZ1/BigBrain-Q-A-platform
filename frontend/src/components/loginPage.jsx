import React, { useState } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
const Login = () => {
    return (
        <div>
            <TextField
                required
                id="outlined-required"
                label="Username"
            />
              <TextField
                required
                id="outlined-required"
                label="email"
            />
              <TextField
                required
                id="outlined-required"
                label="email"
            />
        </div>
    )
}
export default Login;