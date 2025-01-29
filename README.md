# Race Kart APP 🏃‍♂️

## 📱 Sobre o Projeto
Race Tracking App é uma aplicação desenvolvida com React Native e Expo que permite acompanhar corridas em tempo real, registrando tempo, distância, velocidade e posição dos corredores.

## 🚀 Funcionalidades
- Rastreamento de localização em tempo real
- Cronômetro de volta
- Mapa com rota do corredor
- Lista de ranking dos corredores
- Medição de velocidade e distância
- Interface adaptativa para web e mobile

## 🛠 Tecnologias Utilizadas
- React Native
- Expo
- TypeScript
- TailwindCSS (via twrnc)
- expo-location
- react-native-web (para versão web)

## 📁 Estrutura do Projeto
```
race-tracking-app/
├── .vscode/
├── assets/
│   ├── fonts/
│   └── images/
│       ├── adaptive-icon.png
│       ├── favicon.png
│       ├── icon.png
│       ├── partial-react-logo.png
│       ├── react-logo.png
│       ├── react-logo@2x.png
│       ├── react-logo@3x.png
│       └── splash-icon.png
├── src/
│   └── app/
│       ├── _layout.tsx
│       ├── cronometro.tsx
│       ├── index.tsx
│       ├── MapComponent.tsx
│       ├── RankingList.tsx
│       ├── SpeedDisplay.tsx
│       └── SpeedTracker.tsx
│       ├── assets/
│       │   └── logo.png
│       └── styles/
│           └── global.css
│       └── types/
│           └── nativewind-env.d.ts
├── .gitattributes
├── .gitignore
└── app.json
```

## ⚙️ Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn
- Expo CLI
- Git

## 📥 Instalação

1. Clone o repositório:
```bash
git clone [url-do-seu-repositorio]
cd race-tracking-app
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Instale as dependências específicas para web:
```bash
npx expo install react-native-web react-dom @expo/webpack-config
```

## 🎯 Como Executar

### Mobile
```bash
# Iniciar o app no modo desenvolvimento
npx expo start

# Para Android
npx expo start --android

# Para iOS
npx expo start --ios
```

### Web
```bash
# Iniciar a versão web
npx expo start --web
```

## 📱 Principais Componentes

- `_layout.tsx`: Layout principal da aplicação
- `cronometro.tsx`: Componente do cronômetro
- `index.tsx`: Ponto de entrada da aplicação
- `MapComponent.tsx`: Componente de mapa para rastreamento
- `RankingList.tsx`: Lista de ranking dos corredores
- `SpeedDisplay.tsx`: Exibição de velocidade
- `SpeedTracker.tsx`: Rastreamento de velocidade

## 🔄 Recursos Específicos da Web

### Geolocalização
A aplicação usa diferentes APIs de geolocalização dependendo da plataforma:
- Mobile: expo-location
- Web: navigator.geolocation

### Mapas
- Mobile: react-native-maps
- Web: Google Maps ou Leaflet (necessário configurar)

## 🤝 Contribuindo
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença
Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte
Para suporte, envie um email para [marcos.camarg0@outlook.com]