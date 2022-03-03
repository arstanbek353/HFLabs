class SearchComponent extends HTMLElement {
    constructor() {
        super();
    }

    style() {
        return `
            <style>
                * {
                    box-sizing: border-box;
                    padding: 0;
                    margin: 0;
                }
                
                button,
                input,
                a,
                textarea {
                    outline: none;
                    cursor: pointer;
                    font: inherit;
                }
                input,
                textarea {
                    -webkit-animation: bugfix infinite 1s;
                    line-height: inherit;
                    margin: 0;
                    padding: 0;
                    background-color: transparent;
                    border: none;
                    color: inherit;
                }
                
                
                input {
                    width: 100%;
                    height: 7rem;
                    background-color: #fff;
                    border-radius: 1.4rem;
                    padding-left: 2.3rem;
                    font-size: 1.9rem;
                }
                .search {
                    position: relative;
                    margin-bottom: 2rem;
                }
                ul:empty {
                    display: none;
                }
                ul {
                    list-style: none;
                    position: absolute;
                    border-top: 1px solid #ccc;
                    width: 100%;
                    top: 100%;
                    max-height: 72rem;
                    overflow: auto;
                    left: 0;
                    background-color: #fff;
                    padding: 1.2rem;
                    padding-bottom: 0;
                    box-shadow: 2rem 3rem 12rem rgb(149 156 165 / 25%);
                }
                li {
                    width: 100%;
                    font-size: 1.6rem;
                    cursor: pointer;
                    padding: 1rem 0;
                    list-style: none;
                }
                li b {
                    margin-bottom: 3rem;
                }
                .title {
                    font-size: 2.2rem;
                    margin-bottom: 1rem;
                }
                td {
                    font-size: 2rem;
                    padding-right: 2rem;
                    padding-bottom: 1rem;
                    padding-top: 1rem;
                    border-bottom: 1px solid #ccc;
                }
                
                @media (max-width: 48em) {
                    html {
                        font-size: 1.33333vw;
                    }
                
                    .container {
                        padding: 15px;
                    }
                    table {
                        display: block;
                    }
                    tr {
                        display: block;
                        border-bottom: 1px solid #ccc;
                        padding-top: 1rem;
                        padding-bottom: 1rem;
                    }
                    td {
                        display: block;
                        font-size: 2rem;
                        padding-right: 0;
                        padding-bottom: 0;
                        padding-top: 0;
                        border-bottom: none;
                    }
                }
            </style>
        `
    }

    render() {

        this.shadow.innerHTML = `
            ${this.style()}
            <p class="title">Компания или ИП</p>
            <div class="search">
                <input type="text" placeholder="Введите название, ИНН, ОГРН или адрес организации"/>
                <ul></ul>
            </div>
            <div class='result'>
            </div>
        `
    }

    renderDrop(arr = []) {
        let html = null
        if (arr.length !== 0) {
            html = arr.map(item => {
                return `
                    <li data-sign="${item.sign}">
                        <b>${item.name}</b>
                        <p>${item.inn} ${item.address}</p>
                    </li>
                `
            }).join('')
        }
        this.listNode.innerHTML = html
    }

    renderResult(data) {
        this.resultNode.innerHTML = `
            <div class="title">
                <p>
                    <span>${data.company.individual ? 'Индивидуальный предприниматель' : 'Организация'}</span>
                    <b>${data.company.individual ? 'INDIVIDUAL' : 'LEGAL'}</b>
                </p>
            </div>
            <table>
                <tbody>
                    <tr>
                        <td>Краткое наименование:</td>
                        <td><b>${data.company.main.short_name}</b></td>
                    </tr>
                    <tr>
                        <td>Полное наименование:</td>
                        <td><b>${data.company.main.full_name}</b></td>
                    </tr>
                    <tr>
                        <td>ИНН / КПП:</td>
                        <td><b>${data.company.main.inn} / ${data.company.main.kpp}</b></td>
                    </tr>
                    <tr>
                        <td>Адрес:</td>
                        <td><b>${data.company.address.canonic}</b></td>
                    </tr>
                </tbody>
            </table>
        `
    }

    async request(url) {
        const res = await fetch(url).then((response) => {
            return response.json();
        })
        return res
    }

    async onInputHendler(e) {
        const value = e.target.value
        if (!value) return;
        const query = encodeURIComponent(value)
        const res = await this.request(`http://ahunter.ru/site/suggest/company?companylim=10;output=json|pretty;query=${query}`)
        this.renderDrop(res.suggestions)
    }

    async onSuggestionHendler(e) {
        const value = e.target.closest('li').getAttribute('data-sign')
        if (!value) return;
        const query = encodeURIComponent(value)
        const res = await this.request(`https://ahunter.ru/site/fetch/company?output=json;query=${query}`)
        this.renderDrop()
        this.renderResult(res)

    }

    connectedCallback() {
        this.shadow = this.attachShadow({ mode: 'open' });
        this.render()

        this.inputNode = this.shadow.querySelector('input')
        this.inputNode.addEventListener('input', this.onInputHendler.bind(this))

        this.listNode = this.shadow.querySelector('ul')
        this.listNode.addEventListener('click', this.onSuggestionHendler.bind(this))

        this.resultNode = this.shadow.querySelector('.result')
    }

    disconnectedCallback() {
        this.inputNode.removeEventListener('input', this.onInputHendler)
        this.inputNode.removeEventListener('click', this.onSuggestionHendler)
    }
}

customElements.define('search-component', SearchComponent);