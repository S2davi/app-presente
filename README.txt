README - App gerado: {folder_name}

Como usar:
1) Abra o terminal e rode:
   cd {folder_name}
   python -m http.server 8000

2) Abra no navegador do seu celular (mesma rede Wi-Fi do PC):
   http://<IP-do-seu-PC>:8000/index.html
   OU abra no navegador do próprio PC: http://localhost:8000/index.html

3) No Chrome/Edge/Firefox mobile você pode "Adicionar à tela inicial" (Add to Home Screen)
   — isso instala como um PWA com ícone.

Observações:
- Se quiser que o app envie notificações reais no mobile, é preciso hospedar em HTTPS.
- Para trocar as mensagens ou metas, edite localStorage no devtools ou remova o item 'florescer_state_v1' para reiniciar.
