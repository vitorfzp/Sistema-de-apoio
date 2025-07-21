// Objeto de configuração que você copiou do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCvJGUD312OYNTE4Tlq5xJW3UStlmpDzZA",
  authDomain: "sistema-de-apoio-48cb5.firebaseapp.com",
  projectId: "sistema-de-apoio-48cb5",
  storageBucket: "sistema-de-apoio-48cb5.firebasestorage.app",
  messagingSenderId: "243776059532",
  appId: "1:243776059532:web:0c103b65e1032d849863a9",
  measurementId: "G-H4H6LXMPRS"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Inicializa o Cloud Firestore
const db = firebase.firestore();

// --- LÓGICA DE REMÉDIOS ---

const remediosHojeDiv = document.getElementById('remedios-hoje');
const formAddRemedio = document.getElementById('form-add-remedio');

// Função para exibir os remédios
const exibirRemedios = (doc) => {
    const data = doc.data();
    const id = doc.id;
    
    // Lógica de "faltando"
    const limiarFaltando = 5; // Avisar quando tiver 5 ou menos comprimidos
    const estaFaltando = data.quantidadeAtual <= limiarFaltando;
    
    const card = document.createElement('div');
    card.className = `remedio-card ${estaFaltando ? 'faltando' : ''}`;
    
    card.innerHTML = `
        <h3>${data.nome} - ${data.dosagem}</h3>
        <p><strong>Horários:</strong> ${data.horarios.join(', ')}</p>
        <p><strong>Quantidade restante:</strong> ${data.quantidadeAtual} de ${data.quantidadeTotal}</p>
        ${estaFaltando ? '<p style="color: #ee9b00; font-weight: bold;">Atenção: Remédio está acabando!</p>' : ''}
    `;
    
    remediosHojeDiv.appendChild(card);
};

// Escuta por mudanças na coleção de medicamentos em tempo real
db.collection('medicamentos').onSnapshot(snapshot => {
    remediosHojeDiv.innerHTML = ''; // Limpa a lista antes de adicionar os itens atualizados
    snapshot.docs.forEach(doc => {
        exibirRemedios(doc);
    });
});

// Adicionar um novo remédio
formAddRemedio.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('remedio-nome').value;
    const dosagem = document.getElementById('remedio-dosagem').value;
    const horarios = document.getElementById('remedio-horarios').value.split(',').map(h => h.trim());
    const quantidade = parseInt(document.getElementById('remedio-qtd').value);
    
    try {
        await db.collection('medicamentos').add({
            nome: nome,
            dosagem: dosagem,
            horarios: horarios,
            quantidadeTotal: quantidade,
            quantidadeAtual: quantidade // Começa com a quantidade total
        });
        formAddRemedio.reset();
        alert('Remédio adicionado com sucesso!');
    } catch (error) {
        console.error("Erro ao adicionar remédio: ", error);
        alert('Ocorreu um erro ao adicionar o remédio.');
    }
});


// --- LÓGICA DE CONSULTAS ---

const proximasConsultasDiv = document.getElementById('proximas-consultas');
const formAddConsulta = document.getElementById('form-add-consulta');

// Função para formatar a data
const formatarData = (timestamp) => {
    const data = timestamp.toDate();
    return data.toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

// Função para exibir as consultas
const exibirConsultas = (doc) => {
    const data = doc.data();
    const id = doc.id;

    const card = document.createElement('div');
    card.className = 'consulta-card';
    
    card.innerHTML = `
        <h3>${data.especialidade}</h3>
        <p><strong>Data e Horário:</strong> ${formatarData(data.dataHora)}</p>
        <p><strong>Local:</strong> ${data.local}</p>
    `;
    
    proximasConsultasDiv.appendChild(card);
};

// Escuta por mudanças e ordena por data
db.collection('consultas').orderBy('dataHora', 'asc').onSnapshot(snapshot => {
    proximasConsultasDiv.innerHTML = '';
    snapshot.docs.forEach(doc => {
        exibirConsultas(doc);
    });
});


// Adicionar uma nova consulta
formAddConsulta.addEventListener('submit', async (e) => {
    e.preventDefault();

    const especialidade = document.getElementById('consulta-especialidade').value;
    const dataHora = new Date(document.getElementById('consulta-data').value);
    const local = document.getElementById('consulta-local').value;

    try {
        await db.collection('consultas').add({
            especialidade: especialidade,
            dataHora: firebase.firestore.Timestamp.fromDate(dataHora),
            local: local
        });
        formAddConsulta.reset();
        alert('Consulta agendada com sucesso!');
    } catch (error) {
        console.error("Erro ao agendar consulta: ", error);
        alert('Ocorreu um erro ao agendar a consulta.');
    }
});