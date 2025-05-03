const fs = require('fs');
const path = require('path');

const newBanner = `/**
* Copyright (c) 2025 Kruceo
* This file is part of @kruceo/clickhouse-datasource.
* Read the license file "LICENSE" at root of package 
*/\n\n`;

// Regex para identificar o banner antigo do NocoBase no início do arquivo
const nocobaseBannerRegex = /^\/\*\*[\s\S]*?[\s\S]*?\*\/\s*/;

function replaceBanner(content) {
  if (nocobaseBannerRegex.test(content)) {
    return content.replace(nocobaseBannerRegex, newBanner);
  } else if (!content.startsWith('/**')) {
    return newBanner + content; // se não tem banner nenhum
  }
  return content; // já tem algum outro banner, não modifica
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const updated = replaceBanner(content);
  if (content !== updated) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`Banner atualizado: ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

processDirectory(process.argv[2]); // ou o caminho que contém os arquivos
