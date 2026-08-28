import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pastores oficiales
const pastors = [
  {
    code: 'PM-00125',
    name: 'Marcela_Arroyo',
    fullName: 'Marcela Alejandra Arroyo',
    role: 'Pastora Principal',
    dni: '20.634.244',
  },
  {
    code: 'PM-00126',
    name: 'Jorge_Guevara',
    fullName: 'Jorge Emanuel Guevara',
    role: 'Pastor',
    dni: '32.782.472',
  },
  {
    code: 'PM-00127',
    name: 'Yesica_Leyes',
    fullName: 'Yesica Támara Leyes',
    role: 'Pastora',
    dni: '35.852.980',
  },
  {
    code: 'PM-00128',
    name: 'Karina_Andrada',
    fullName: 'Karina Soledad Andrada',
    role: 'Pastora',
    dni: '28.560.882',
  },
];

// Base URL oficial de producción
// Ej: node scripts/generate-pastor-qrs.js https://montedesionoficial.vercel.app
const baseUrl = process.argv[2] || 'https://montedesionoficial.vercel.app';


const publicDir = path.resolve(__dirname, '../public/qr-credentials');
const assetsDir = path.resolve(__dirname, '../assets/qr-credentials');

[publicDir, assetsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log(`Generando códigos QR oficiales usando base URL: ${baseUrl}\n`);

async function generateQRs() {
  for (const pastor of pastors) {
    const verifyUrl = `${baseUrl.replace(/\/+$/, '')}/verificar/${pastor.code}`;
    const baseFilename = `${pastor.code}_${pastor.name}`;

    // Generar PNG en alta resolución (1024x1024) para imprenta / diseño de carnets
    const pngOptions = {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 1024,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    };

    const pngPublicPath = path.join(publicDir, `${baseFilename}.png`);
    const pngAssetsPath = path.join(assetsDir, `${baseFilename}.png`);

    await QRCode.toFile(pngPublicPath, verifyUrl, pngOptions);
    fs.copyFileSync(pngPublicPath, pngAssetsPath);

    // Generar SVG vectorial escalable infinito
    const svgOptions = {
      errorCorrectionLevel: 'H',
      type: 'svg',
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    };

    const svgPublicPath = path.join(publicDir, `${baseFilename}.svg`);
    const svgAssetsPath = path.join(assetsDir, `${baseFilename}.svg`);

    const svgString = await QRCode.toString(verifyUrl, svgOptions);
    fs.writeFileSync(svgPublicPath, svgString, 'utf-8');
    fs.writeFileSync(svgAssetsPath, svgString, 'utf-8');

    console.log(`✓ [${pastor.code}] ${pastor.fullName} (${pastor.role})`);
    console.log(`   URL: ${verifyUrl}`);
    console.log(`   PNG: public/qr-credentials/${baseFilename}.png`);
    console.log(`   SVG: public/qr-credentials/${baseFilename}.svg\n`);
  }

  console.log(`¡Todos los códigos QR se han generado exitosamente en:`);
  console.log(`📁 ${publicDir}`);
  console.log(`📁 ${assetsDir}`);
}

generateQRs().catch(console.error);
