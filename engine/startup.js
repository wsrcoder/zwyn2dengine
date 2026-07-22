
import Engine from "./Core/Engine.js"


const canvas = document.querySelector("#screen");


if (!canvas) {

    throw new Error(
        "Canvas não encontrado"
    );

}



const engine = new Engine({

    canvas: canvas

});

await engine.initialize().then(() =>{
    engine.run();
}).catch((erro) => {
        // Se QUALQUER coisa der errado no initialize (ex: mapa sumiu), cai aqui:
        console.error("Zwyn Engine [Fatal Error]: Falha crítica na inicialização.");
        
        // No futuro, aqui você atualiza a UI para o jogador:
        // Ex: minhaview.exibirMensagemErro("Erro ao carregar arquivos do jogo.");
    });




// --- TESTE DE FULLSCREEN ---
// Adicionamos um escutador temporário no teclado para burlar a trava do navegador
window.addEventListener("keydown", (event) => {
    // Se pressionar a tecla F2
    if (event.key === "F2") {
        // Evita qualquer comportamento padrão que o sistema possa ter
        event.preventDefault(); 
        engine.screen.toggleFullscreen();
    }
});