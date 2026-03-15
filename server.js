const express = require('express');
const { exec, spawn } = require('child_process');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 3000;

// ===== FUNCIONES ÚTILES =====
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor(((seconds % 86400) % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ===== INICIAR SSHX.IO =====
console.log('\n' + '='.repeat(50));
console.log('🔌 INICIANDO SSHX.IO - BUSCA TU ENLACE AQUÍ ABAJO 🔌');
console.log('='.repeat(50));

// Intentar diferentes métodos para iniciar sshx
function iniciarSSHX() {
    // Método 1: Usando npx directamente
    const sshx = spawn('npx', ['--yes', 'sshx'], {
        stdio: ['inherit', 'pipe', 'pipe']
    });
    
    sshx.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`📡 ${output}`);
        // Si encuentra un enlace sshx, lo resalta
        if (output.includes('https://sshx.io')) {
            console.log('\n' + '🔗' .repeat(20));
            console.log('🔗 ENLACE ENCONTRADO: ' + output.trim());
            console.log('🔗' .repeat(20) + '\n');
        }
    });
    
    sshx.stderr.on('data', (data) => {
        console.log(`⚠️ ${data.toString()}`);
    });
    
    sshx.on('error', (err) => {
        console.log('❌ Error con spawn:', err.message);
        // Método 2: Fallback con exec
        exec('npx sshx', (error, stdout, stderr) => {
            if (error) {
                console.log('❌ SSHX no disponible. Instalando...');
                exec('npm install -g sshx', (err2) => {
                    if (!err2) {
                        console.log('✅ SSHX instalado. Ejecutando...');
                        exec('sshx', (e, out) => console.log(out || e));
                    }
                });
            }
            if (stdout) console.log('📡', stdout);
        });
    });
}

// Esperar 2 segundos para que todo cargue y luego iniciar sshx
setTimeout(iniciarSSHX, 2000);

// ===== ENDPOINTS =====
app.get('/', (req, res) => {
    res.json({
        status: '🔥 THERMOS ACTIVO',
        uptime: formatUptime(os.uptime()),
        memoria: `${formatBytes(os.freemem())} libres de ${formatBytes(os.totalmem())}`,
        cpu: os.cpus()[0].model,
        carga: os.loadavg(),
        hora: new Date().toLocaleString()
    });
});

app.get('/health', (req, res) => {
    res.send('🔥 vivo');
});
app.get('/ping', (req, res) => {
    res.send('pong');
});

app.get('/ls', (req, res) => {
    exec('ls -la', (e, stdout) => {
        res.send(`<pre>${stdout || e?.message}</pre>`);
    });
});

app.get('/df', (req, res) => {
    exec('df -h', (e, stdout) => {
        res.send(`<pre>${stdout || e?.message}</pre>`);
    });
});

app.get('/ps', (req, res) => {
    exec('ps aux', (e, stdout) => {
        res.send(`<pre>${stdout || e?.message}</pre>`);
    });
});

app.get('/sshx', (req, res) => {
    res.send(`
        <html>
            <head><title>SSHX Link</title></head>
            <body style="background:#000;color:#0f0;font-family:monospace;padding:20px">
                <pre>
🔗 PARA OBTENER EL ENLACE SSHX:

1. Ve a los LOGS de Railway
2. Busca la línea que empieza con "https://sshx.io/s/"
3. Copia y pega ese enlace en tu navegador

📡 También puedes intentar:
$ npx sshx

🔄 Recarga esta página en 10 segundos para ver si aparece el enlace abajo:
                </pre>
                <div id="logs" style="border:1px solid #0f0; padding:10px; margin-top:20px"></div>
                <script>
                    setInterval(() => {
                        fetch('/health')
                            .then(r => r.text())
                            .then(t => {
                                document.getElementById('logs').innerHTML += '🟢 ' + new Date().toLocaleTimeString() + '<br>';
                            });
                    }, 5000);
                </script>
            </body>
        </html>
    `);
});

app.get('*', (req, res) => {
    res.send(`
        <html>
            <head><title>Thermos con SSHX</title></head>
            <body style="background:#000;color:#0f0;font-family:monospace;padding:20px">
                <pre>
🔥 THERMOS CON SSHX 🔥
══════════════════════
Endpoints:
• /       - Info del sistema
• /health - Health check
• /ls     - Listar archivos
• /df     - Espacio en disco  
• /ps     - Procesos activos
• /sshx   - Info SSHX

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

// Iniciar servidor
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🔥 Thermos activo en puerto ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log('='.repeat(50));
});
