const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 'abc1', rol: 'ADMIN' }, 'JSONWEBTOKENSECRETCODE', { expiresIn: '1h' });

fetch('http://localhost:3005/usuarios/bomberos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(d => console.log(JSON.stringify(d, null, 2)))
.catch(console.error);
