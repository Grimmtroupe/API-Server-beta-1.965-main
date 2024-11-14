const periodicRefreshPeriod = 10;
let categories = [];
let selectedCategory = "";
let currentETag = "";
let hold_Periodic_Refresh = false;
let pageManager;
let itemLayout;

let waiting = null;
let waitingGifTrigger = 2000;

function addWaitingGif() {
    clearTimeout(waiting);
    waiting = setTimeout(() => {
        $("#itemsPanel").append($("<div id='waitingGif' class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
    }, waitingGifTrigger)
}
function removeWaitingGif() {
    clearTimeout(waiting);
    $("#waitingGif").remove();
}

Init_UI();

async function Init_UI() {
    itemLayout = {
        width: $("#sample").outerWidth(),
        height: $("#sample").outerHeight()
    };
    pageManager = new PageManager('scrollPanel', 'itemsPanel', itemLayout, renderArticles);
    compileCategories();
    $('#createArticle').on("click", async function () {
        renderCreateArticleForm();
    });
    $('#abort').on("click", async function () {
        showArticle()
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
    showArticle();
    start_Periodic_Refresh();
}
function showArticle() {
    $("#actionTitle").text("Liste des favoris");
    $("#scrollPanel").show();
    $('#abort').hide();
    $('#articleForm').hide();
    $('#aboutContainer').hide();
    $("#createArticle").show();
    hold_Periodic_Refresh = false;
}
function hideArticle() {
    $("#scrollPanel").hide();
    $("#createArticle").hide();
    $("#abort").show();
    hold_Periodic_Refresh = true;
}
function start_Periodic_Refresh() {
    setInterval(async () => {
        if (!hold_Periodic_Refresh) {
            let etag = await Articles_API.HEAD();
            if (currentETag != etag) {
                currentETag = etag;
                await pageManager.update(false);
                compileCategories();
            }
        }
    },
        periodicRefreshPeriod * 1000);
}
function renderAbout() {
    hideArticle();
    $("#actionTitle").text("À propos...");
    $("#aboutContainer").show();
}
function updateDropDownMenu() {
    let DDMenu = $("#DDMenu");
    let selectClass = selectedCategory === "" ? "fa-check" : "fa-fw";
    DDMenu.empty();
    DDMenu.append($(`
        <div class="dropdown-item menuItemLayout" id="allCatCmd">
            <i class="menuIcon fa ${selectClass} mx-2"></i> Toutes les catégories
        </div>
        `));
    DDMenu.append($(`<div class="dropdown-divider"></div>`));
    categories.forEach(category => {
        selectClass = selectedCategory === category ? "fa-check" : "fa-fw";
        DDMenu.append($(`
            <div class="dropdown-item menuItemLayout category" id="allCatCmd">
                <i class="menuIcon fa ${selectClass} mx-2"></i> ${category}
            </div>
        `));
    })
    DDMenu.append($(`<div class="dropdown-divider"></div> `));
    DDMenu.append($(`
        <div class="dropdown-item menuItemLayout" id="aboutCmd">
            <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
        </div>
        `));
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
    $('#allCatCmd').on("click", function () {
        showArticle();
        selectedCategory = "";
        updateDropDownMenu();
        pageManager.reset();
    });
    $('.category').on("click", function () {
        showArticle();
        selectedCategory = $(this).text().trim();
        updateDropDownMenu();
        pageManager.reset();
    });
}
async function compileCategories() {
    categories = [];
    let response = await Articles_API.GetQuery("?fields=category&sort=category");
    if (!Articles_API.error) {
        let items = response.data;
        if (items != null) {
            items.forEach(item => {
                if (!categories.includes(item.Category))
                    categories.push(item.Category);
            })
            updateDropDownMenu(categories);
        }
    }
}
async function renderArticles(queryString) {
    let endOfData = false;
    queryString += "&sort=category";
    if (selectedCategory != "") queryString += "&category=" + selectedCategory;
    addWaitingGif();
    let response = await Articles_API.Get(queryString);
    if (!Articles_API.error) {
        currentETag = response.ETag;
        let Articles = response.data;
        if (Articles.length > 0) {
            Articles.forEach(Article => {
                $("#itemsPanel").append(renderArticle(Article));
            });
            $(".editCmd").off();
            $(".editCmd").on("click", function () {
                renderEditArticleForm($(this).attr("editArticleId"));
            });
            $(".deleteCmd").off();
            $(".deleteCmd").on("click", function () {
                renderDeleteArticleForm($(this).attr("deleteArticleId"));
            });
        } else
            endOfData = true;
    } else {
        renderError(Articles_API.currentHttpError);
    }
    removeWaitingGif();
    return endOfData;
}

function renderError(message) {
    hideArticle();
    $("#actionTitle").text("Erreur du serveur...");
    $("#errorContainer").show();
    $("#errorContainer").append($(`<div>${message}</div>`));
}
function renderCreateArticleForm() {
    renderArticleForm();
}
async function renderEditArticleForm(id) {
    addWaitingGif();
    let response = await Articles_API.Get(id)
    if (!Articles_API.error) {
        let Article = response.data;
        if (Article !== null)
            renderArticleForm(Article);
        else
            renderError("Article introuvable!");
    } else {
        renderError(Articles_API.currentHttpError);
    }
    removeWaitingGif();
}
async function renderDeleteArticleForm(id) {
    hideArticle();
    $("#actionTitle").text("Retrait");
    $('#articleForm').show();
    $('#articleForm').empty();
    let response = await Articles_API.Get(id)
    if (!Articles_API.error) {
        let Article = response.data;
        if (Article !== null) {
            $("#articleForm").append(`
        <div class="ArticledeleteForm">
            <h4>Effacer le favori suivant?</h4>
            <br>
            <div class="ArticleRow" id=${Article.Id}">
                <div class="ArticleContainer noselect">
                    <div class="ArticleLayout">
                        <div class="Article">
                            <a href="${Article.Url}" target="_blank"></a>
                            <span class="ArticleTitle">${Article.Title}</span>
                        </div>
                        <span class="ArticleCategory">${Article.Category}</span>
                    </div>
                    <div class="ArticleCommandPanel">
                        <span class="editCmd cmdIcon fa fa-pencil" editArticleId="${Article.Id}" title="Modifier ${Article.Title}"></span>
                        <span class="deleteCmd cmdIcon fa fa-trash" deleteArticleId="${Article.Id}" title="Effacer ${Article.Title}"></span>
                    </div>
                </div>
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteArticle" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
            $('#deleteArticle').on("click", async function () {
                await Articles_API.Delete(Article.Id);
                if (!Articles_API.error) {
                    showArticle();
                    await pageManager.update(false);
                    compileCategories();
                }
                else {
                    console.log(Articles_API.currentHttpError)
                    renderError("Une erreur est survenue!");
                }
            });
            $('#cancel').on("click", function () {
                showArticle();
            });

        } else {
            renderError("Article introuvable!");
        }
    } else
        renderError(Articles_API.currentHttpError);
}
function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}
function newArticle() {
    Article = {};
    Article.Id = 0;
    Article.Title = "";
    Article.Text = "";
    Article.Category = "";
    Articles.Image = "";
    Articles.Creation = ""
    return Article;
}
function renderArticleForm(Article = null) {
    hideArticle();
    let create = Article == null;
    if (create)
        Article = newArticle();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#articleForm").show();
    $("#articleForm").empty();
    $("#articleForm").append(`
        <form class="form" id="articleForm">
            <br>
            <input type="hidden" name="Id" value="${Article.Id}"/>

            <label for="Title" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal"
                value="${Article.Title}"
            />
            <label for="Url" class="form-label">Url </label>
            <input
                class="form-control URL"
                name="Url"
                id="Url"
                placeholder="Url"
                required
                value="${Article.Url}" 
            />
            <label for="Category" class="form-label">Catégorie </label>
            <input 
                class="form-control"
                name="Category"
                id="Category"
                placeholder="Catégorie"
                required
                value="${Article.Category}"
            />
            <br>
            <input type="submit" value="Enregistrer" id="saveArticle" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#articleForm').on("submit", async function (event) {
        event.preventDefault();
        let Article = getFormData($("#articleForm"));
        Article = await Articles_API.Save(Article, create);
        if (!Articles_API.error) {
            showArticle();
            await pageManager.update(false);
            compileCategories();
            pageManager.scrollToElem(Article.Id);
        }
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        showArticle();
    });
}
function renderArticle(Article) {
    return $(`
     <div class="ArticleRow" id='${Article.Id}'>
        <div class="ArticleContainer noselect">
            <div class="ArticleLayout">
                <div class="Article">
                    <a href="${Article.Url}" target="_blank"> </a>
                    <span class="ArticleTitle">${Article.Title}</span>
                </div>
                <span class="ArticleCategory">${Article.Category}</span>
            </div>
            <div class="ArticleCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editArticleId="${Article.Id}" title="Modifier ${Article.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteArticleId="${Article.Id}" title="Effacer ${Article.Title}"></span>
            </div>
        </div>
    </div>           
    `);
}
