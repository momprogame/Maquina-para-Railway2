const express = require('express');
const { exec } = require('child_process');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 3000;

// ===== FUNCIONES ÚTILES =====
const f = { 
  uptime: s => `${Math.floor(s/86400)}d ${Math.floor((s%86400)/3600)}h ${Math.floor(((s%86400)%3600)/60)}m`,
  bytes: b => b==0?'0 Bytes':(b/1024**((i=Math.floor(Math.log(b)/Math.log(1024)))>0?i:0)).toFixed(2)+' '+['Bytes','KB','MB','GB'][i]||'Bytes'
};

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
  
  // Ejecutar comandos (solo lectura)
  if(path === '/ls' || path === '/df' || path === '/ps') {
    const cmd = path.substring(1); // quita el /
    exec(cmd, (e, stdout) => res.send(`<pre>${stdout || e?.message}</pre>`));
    return;
  }
  
  // Cualquier otra cosa - 404 bonito
  res.send(`
    <html>
      <head><title>Thermos</title></head>
      <body style="background:#000;color:#0f0;font-family:monospace;padding:20px">
        <pre>
🔥 THERMOS ACTIVO 🔥
════════════════════
Endpoints disponibles:
• /      - Info del sistema
• /health- Health check
• /ls    - Listar archivos
• /df    - Espacio en disco  
• /ps    - Procesos activos
════════════════════
🔥 Siempre a 100°C 🔥
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

app.listen(PORT, () => console.log(`🔥 Thermos activo en puerto ${PORT}`));
