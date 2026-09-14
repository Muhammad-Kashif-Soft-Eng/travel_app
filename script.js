const recommendationDataUrl = 'travel_recommendation_api.json';

function getSearchableRecommendations(data) {
    const countries = data.countries.flatMap(country => country.cities.map(city => ({
        ...city,
        category: 'country',
        country: country.name
    })));

    return [
        ...data.beaches.map(item => ({ ...item, category: 'beach' })),
        ...data.temples.map(item => ({ ...item, category: 'temple' })),
        ...countries
    ];
}

function renderRecommendations(results, resultsContainer) {
    resultsContainer.innerHTML = '';

    if (!results.length) {
        resultsContainer.innerHTML = '<p class="empty-state">No recommendations found. Try "beach", "temple", or "country".</p>';
        return;
    }

    results.slice(0, 2).forEach(item => {
        const card = document.createElement('article');
        card.className = 'result-card';
        card.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" loading="lazy">
            <div class="result-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
            </div>
        `;
        resultsContainer.appendChild(card);
    });
}

const searchElements = document.getElementById('btnSearch');
if (searchElements) {
    const searchBtn = document.getElementById('btnSearch');
    const clearBtn = document.getElementById('btnClear');
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');

    // Search functionality
    const search = () => {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            renderRecommendations([], resultsContainer);
            return;
        }

        fetch(recommendationDataUrl)
            .then(response => {
                if (!response.ok) throw new Error('Could not load recommendations');
                return response.json();
            })
            .then(data => {
                const recommendations = getSearchableRecommendations(data);
                const results = recommendations.filter(item => {
                    const searchableText = `${item.name} ${item.description} ${item.country || ''} ${item.category}`.toLowerCase();
                    return searchableText.includes(query);
                });

                renderRecommendations(results, resultsContainer);
            })
            .catch(() => {
                resultsContainer.innerHTML = '<p class="empty-state">Recommendations are temporarily unavailable. Please try again.</p>';
            });
    };

    searchBtn.addEventListener('click', search);
    searchInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') search();
    });

    document.querySelectorAll('.quick-search').forEach(button => {
        button.addEventListener('click', () => {
            searchInput.value = button.dataset.query;
            search();
        });
    });

    // Clear functionality
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        resultsContainer.innerHTML = '';
    });
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', event => {
        event.preventDefault();
        document.getElementById('formStatus').textContent = 'Thank you. Your message has been received.';
        contactForm.reset();
    });
}