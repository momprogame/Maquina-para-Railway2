const express = require('express');
const { exec, spawn } = require('child_process');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 3000;

// ===== FUNCIONES ÚTILES =====
const f = { 
  uptime: s => `${Math.floor(s/86400)}d ${Math.floor((s%86400)/3600)}h ${Math.floor(((s%86400)%3600)/60)}m`,
  bytes: b => b==0?'0 Bytes':(b/1024**((i=Math.floor(Math.log(b)/Math.log(1024)))>0?i:0)).toFixed(2)+' '+['Bytes','KB','MB','GB'][i]||'Bytes'
};

// ===== INICIAR SSHX.IO =====
console.log('\n🔌 INICIANDO SSHX.IO - BUSCA TU ENLACE AQUÍ ABAJO 🔌');
console.log('═══════════════════════════════════════════════════');

// Método 1: Usando exec para capturar salida
const sshx = exec('npx sshx', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Error al iniciar sshx:', error.message);
    return;
  }
  if (stdout) console.log('📡 SSHX OUTPUT:', stdout);
  if (stderr) console.log('⚠️ SSHX LOG:', stderr);
});

// Capturar la salida en tiempo real para ver el enlace inmediatamente
sshx.stdout.on('data', (data) => {
  console.log(`🔗 ${data}`); // Aquí aparecerá el enlace https://sshx.io/s/...
});

sshx.stderr.on('data', (data) => {
  console.log(`⚠️ ${data}`);
});

// Método 2: También probar con spawn (más confiable)
try {
  const sshx_spawn = spawn('npx', ['sshx'], { stdio: 'inherit' });
  console.log('✅ SSHX iniciado con spawn');
} catch (err) {
  console.log('⚠️ Error con spawn:', err.message);
}

console.log('═══════════════════════════════════════════════════\n');

// ===== ÚNICO ENDPOINT QUE LO HACE TODO =====
app.get('*', (req, res) => {
  const path = req.path;
  
  // Root - Información del thermos
  if(path === '/') {
    return res.json({
      status: '🔥 THERMOS ACTIVO',
      uptime: f.uptime(os.uptime()),
      memoria: `${f.bytes(os.freemem())} libres de ${f.bytes(os.totalmem())}`,
      cpu: os.cpus()[0].model,
      carga: os.loadavg(),
      hora: new Date().toLocaleString()
    });
  }
  
  // Health check para Railway y cron
  if(path === '/health' || path === '/ping') {
    return res.send('🔥 vivo');
  }
  
  // Endpoint especial para obtener el enlace SSHX
  if(path === '/sshx-link') {
    exec('npx sshx --version', (e, stdout) => {
      res.send(`
        <html>
          <body style="background:#000;color:#0f0;font-family:monospace;padding:20px">
            <pre>
🔗 PARA OBTENER EL ENLACE SSHX:

1. Ve a los LOGS de Railway
2. Busca la línea que empieza con "https://sshx.io/s/"
3. Copia y pega ese enlace en tu navegador

O ejecuta este comando en la terminal:
$ npx sshx

📡 Versión SSHX: ${stdout || 'desconocida'}
            </pre>
          </body>
        </html>
      `);
    });
    return;
  }
  
  // Ejecutar comandos (solo lectura)
  if(path === '/ls' || path === '/df' || path === '/ps') {
    const cmd = path.substring(1); // quita el /
    exec(cmd, (e, stdout) => res.send(`<pre>${stdout || e?.message}</pre>`));
    return;
  }
  
  // Cualquier otra cosa - 404 bonito
  res.send(`
    <html>
      <head><title>Thermos con SSHX</title></head>
      <body style="background:#000;color:#0f0;font-family:monospace;padding:20px">
        <pre>
🔥 THERMOS CON SSHX 🔥
══════════════════════
Endpoints disponibles:
• /          - Info del sistema
• /health    - Health check
• /ls        - Listar archivos
• /df        - Espacio en disco  
• /ps        - Procesos activos
• /sshx-link - Info del enlace SSHX

🔥 BUSCA EL ENLACE SSHX EN LOS LOGS 🔥
══════════════════════════════════════
        </pre>
      </body>
    </html>
  `);
});

// ===== AUTO-CALEFACCIÓN =====
setInterval(() => {
  console.log(`🔥 Calentando... ${new Date().toLocaleString()}`);
  exec(`curl -s http://localhost:${PORT}/health > /dev/null`);
}, 300000); // 5 minutos

app.listen(PORT, () => {
  console.log(`🔥 Thermos activo en puerto ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Busca el enlace SSHX arriba 👆`);
});
