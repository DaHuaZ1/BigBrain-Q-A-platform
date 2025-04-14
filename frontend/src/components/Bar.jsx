import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
const Bar = (props) => {
  const logout = () => {}
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          The bigbrain is crazy and fun!
          </Typography>
          {props.token === null
            ? <>
              <Button color="inherit">Login</Button>
              <Button color="inherit">Signup</Button>
            </>
            : <Button color="inherit" onClick={logout}>Logout</Button>
          }
        </Toolbar>
      </AppBar>
    </Box>
  );
}
export default Bar;