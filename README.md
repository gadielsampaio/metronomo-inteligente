# Metrônomo Inteligente / Groove Analyzer

Aplicação web em React + Vite para treino percussivo com metrônomo programável, modo de silêncio e análise de timing via microfone.

## O que faz

- Metrônomo com BPM, tap tempo, compasso, subdivisão e grade editável.
- Estados por célula: clique normal, acento, silêncio e referência muda para análise.
- Ciclo tocar/silenciar compassos, mantendo análise do microfone nos compassos silenciosos.
- Entrada de microfone com medidor, sensibilidade, limiar, debounce e avisos de sinal baixo/saturação.
- Detecção de ataques baseada em RMS, envelope e transiente.
- Comparação dos ataques com a grade rítmica e cálculo de desvio em milissegundos.
- Estatísticas: média, desvio padrão, variação máxima, estabilidade e tendência.
- Presets editáveis salvos em localStorage.
- Painel de calibração manual e calibração simples pelo offset médio da sessão.

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`.

> Para o microfone funcionar, use `localhost` ou HTTPS. Navegadores modernos bloqueiam `getUserMedia` em origem insegura.

## Estrutura

```txt
src/
  audio/
    audioEngine.js          # sons do metrônomo via Web Audio API
    metronomeScheduler.js   # scheduler com AudioContext.currentTime
    microphoneInput.js      # getUserMedia + cadeia de áudio
    onsetDetector.js        # RMS/envelope/transiente
  analysis/
    timingAnalyzer.js       # comparação com grade e estatísticas
  grid/
    gridManager.js          # criação e edição da grade rítmica
  presets/
    presetStorage.js        # presets default + localStorage
  components/
    Controls.jsx
    GridEditor.jsx
    MicPanel.jsx
    PresetPanel.jsx
    StatsPanel.jsx
    TimingChart.jsx
  hooks/
    useTapTempo.js
  App.jsx
  main.jsx
  styles.css
```

## Pontos para evoluir

- Migrar `ScriptProcessorNode` para `AudioWorklet` para menor jitter.
- Criar calibração automática mais robusta com sessão guiada e descarte de outliers.
- Permitir exportação CSV da sessão.
- Implementar filtros por faixa de frequência e perfis por instrumento.
- Adicionar contagem falada ou visual antes da entrada.
