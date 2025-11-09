/**
 * initDarkMode: Pega todos os botões .dark-mode-btn e adiciona a lógica.
 */
export function initDarkMode() {
    document.querySelectorAll('.dark-mode-btn').forEach(btn => {
        const sunIcon = btn.querySelector('.sun-icon');
        const moonIcon = btn.querySelector('.moon-icon');
        const html = document.documentElement;

        // Atualiza ícones com base no estado atual
        const updateIcons = () => {
            if (html.classList.contains('dark')) {
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            } else {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            }
        };

        // Carrega preferência
        if (localStorage.getItem('darkMode') === 'true') {
            html.classList.add('dark');
        }
        updateIcons();

        // Evento de clique
        btn.addEventListener('click', () => {
            html.classList.toggle('dark');
            const isDark = html.classList.contains('dark');
            localStorage.setItem('darkMode', isDark);
            updateIcons();
        });
    });
}