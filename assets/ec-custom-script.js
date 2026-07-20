function spotlightProductsInit() {

    const ecSpotlightContainers = document.querySelectorAll('.ec_spotlight-products');

    function modalInit() {
        ecSpotlightContainers.forEach(container => {

            if (container.dataset.initialized) return;
            container.dataset.initialized = true;

            let spcards = container.querySelectorAll('.ec_spotlight-product--card');

            let spmodals = container.querySelectorAll('.ec_spotlight-product--modal');

            // primary modals close init

            spmodals.forEach((modal) => {

                // close btn & close event
                const closeBtn = modal.querySelector('.ec_spotlight-modal_close--btn');

                closeBtn.addEventListener('click', () => ecCloseModal(modal.dataset.modalid));

                // modal overlay click event

                modal.addEventListener('click', function (e) {
                    if (e.target.closest('.ec_spotlight-product--info_wrapper')) return;

                    modal.style.display = 'none';
                });
            });

            /* single modal close fn accepts card's data-cardid */

            function ecCloseModal(id) {
                spmodals.forEach(modal => {
                    if (modal.dataset.modalid === id) {
                        modal.style.display = 'none';
                    }
                })
            }

            // modal init on card btn click

            spcards.forEach((card) => {
                const button = card.querySelector('.ec_spotlight--btn');

                // Safety check in case a card doesn't have a button
                if (!button) return;

                button.addEventListener('click', function () {
                    const cardId = card.dataset.cardid;
                    const modal = spmodals.forEach(modal => {
                        if (modal.dataset.modalid === cardId) {
                            modal.style.display = 'flex';
                        }
                    });
                });
            });

        })
    }

    function variantDropdown() {

        ecSpotlightContainers.forEach(container => {

            if (container.dataset.dropdownInit) return;
            container.dataset.dropdownInit = true;


            const dropDownElements = container.querySelectorAll(".ec_spotlight-dropdown")

            const dropDownHeaders = container.querySelectorAll(".ec_spotlight-dropdown-header")



            dropDownHeaders.forEach(ddElem => {
                ddElem.addEventListener('click', function () {
                    ddElem.closest(".ec_spotlight-dropdown").classList.toggle("is-open");
                });

            })

            dropDownElements.forEach(element => {
                const dropDownItems = element.querySelectorAll(".ec_spotlight-dropdown-item");

                function updateDDItem(item) {
                    dropDownItems.forEach(item => item.classList.remove("selected"));
                    item.classList.add("selected");
                }

                dropDownItems.forEach(item => {
                    item.addEventListener('click', function (e) {
                        const itemValue = item.dataset.value

                        updateDDItem(item);

                        const placeholderTextElm = element.querySelector(".ec_spotlight-dropdown--palceholder");

                        placeholderTextElm.textContent = itemValue;
                        placeholderTextElm.style.textAlign = "center";

                        element.classList.remove("is-open");
                    });
                })

            })
        })

    }

    function colorVariantBtnAnimation() {
        ecSpotlightContainers.forEach(container => {

            // initialization
            if (container.dataset.variantbtnanimation) return
            container.dataset.variantbtnanimation = true;


            const colorVariantsContainers = container.querySelectorAll(".color_variant--container");


            colorVariantsContainers.forEach(container => {
                const btns = container.querySelectorAll(".variant-selector-btn");

                btns.forEach(btn => {
                    btn.addEventListener('click', function () {
                        updateButton(btn);
                    })
                })

                function btnClassRemove() {
                    btns.forEach(btn => btn.classList.remove('selected'))
                }

                function updateButton(btn) {
                    btnClassRemove();
                    btn.classList.add("selected");
                    // btn.closest(".color_variant--container").querySelector("input.hidden").value = btn.dataset.value;
                    const offsetHeight = btn.offsetHeight;
                    const offsetLeft = btn.offsetLeft;
                    const offsetWidth = btn.offsetWidth;
                    const offsetTop = btn.offsetTop;

                    container.style.setProperty('--ec-width', `${offsetWidth}px`);
                    container.style.setProperty('--ec-height', `${offsetHeight}px`);
                    container.style.setProperty('--ec-left', `${offsetLeft}px`);
                    container.style.setProperty('--ec-top', `${offsetTop}px`);
                }

            })

        })

    }


    function addToCart() {
        ecSpotlightContainers.forEach(container => {

            if (container.dataset.addToCartInit) return;

            container.dataset.addToCartInit = true;


            const spmodal = container.querySelectorAll(".ec_spotlight-product--modal");

            spmodal.forEach(modal => {

                const addToCartBtn = modal.querySelector(".add-to-cart-btn");

                const addToCartBtnTextElm = addToCartBtn.querySelector(".btn-text");

                const btnDefaultText = addToCartBtn.textContent;

                const variantJSON = modal.querySelector(".ec_product-variants-json").textContent;

                const variants = JSON.parse(decodeURIComponent(variantJSON));

                const errorElm = modal.querySelector(".ec_spotlight-product--form--error");

                const successElm = modal.querySelector(".ec_spotlight-product--form--success");

                function showError(errorStr) {

                    let timeOut;

                    if (timeOut) clearTimeout(timeOut);

                    if (errorStr === '') return;

                    if (!errorElm) return;

                    errorElm.textContent = errorStr;

                    timeOut = setTimeout(() => {
                        errorElm.textContent = "";
                    }, 5000);

                    addToCartBtnTextElm.textContent = btnDefaultText;

                }


                addToCartBtn.addEventListener("click", function (e) {
                    e.preventDefault();


                    successElm.textContent = "";
                    addToCartBtnTextElm.textContent = "Adding...";
                    addToCartBtn.disabled = true;

                    const selectedOptions = modal.querySelectorAll(".variant-selector-btn.selected, .ec_spotlight-dropdown-item.selected");

                    const optionValues = Array.from(selectedOptions, (Node) => Node.dataset.value);

                    const matchesVariant = variants.find(variant => {
                        return optionValues.every((optVal, index) => optVal === variant.options[index])
                    })

                    if (!matchesVariant) {
                        showError("This comibination of variants currently unavailable!")
                    }

                    if (optionValues.length != variants[0].options.length) {
                        showError("Please select all the options");
                        return;
                    }

                    const cartElement = document.querySelector("cart-drawer") || document.querySelector("cart-notification");


                    const itemsToCart = {
                        items: [
                            {
                                id: matchesVariant.id,
                                quantity: 1
                            }
                        ]
                    }

                    if (cartElement) {

                        itemsToCart.sections = cartElement.getSectionsToRender().map(s => s.id).join(",");

                        itemsToCart.sections_url = window.location.pathname;

                        cartElement.setActiveElement(document.activeElement);

                    } else {

                        itemsToCart.sections = "cart-drawer, cart-icon-bubble";

                        itemsToCart.sections_url = window.location.pathname;

                    }

                    function submitCart() {
                        fetch(window.Shopify.routes.root + 'cart/add.js', {
                            method: 'POST',
                            headers: {
                                'X-Requested-With': "XMLHttpRequest",
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(itemsToCart)
                        }).then(res => res.json()
                        ).then(response => {

                            if (response.status && response.status !== 200) {
                                showError("Adding to cart failed!");
                            }
                            console.log(response);

                            if (response.items?.length > 0) {
                                response.id = response.items[0].id;
                                response.key = response.items[0].key;
                            }

                            if (cartElement) {
                                cartElement.renderContents(response);
                            }


                            successElm.textContent = "Success"

                            addToCartBtnTextElm.textContent = btnDefaultText;


                        }).catch((error) => {

                            showError("Something went wrong!");
                            console.log(error);

                        }).finally(() => {
                            addToCartBtn.disabled = false;
                            return setTimeout(() => {
                                successElm.textContent = ""
                            }, 2000);
                        });
                    }


                    if (matchesVariant) {
                        const conditonFound = matchesVariant.options.some(val => val.toLowerCase() == 'black') && matchesVariant.options.some(val => val.toLowerCase() == 'm');

                        if (conditonFound && window.upsellProduct) {
                            fetch(window.Shopify.routes.root + `products/${window.upsellProduct}.js`)
                                .then(res => res.json())
                                .then(product => {
                                    if (product && product.variants.length > 0) {
                                        itemsToCart.items.push({ id: product.variants[0].id, quantity: 1 });
                                    }
                                    submitCart()
                                }).catch(err => console.log(err));

                        } else {
                            submitCart();
                        }
                    }


                })


            })

        })
    }

    addToCart();

    colorVariantBtnAnimation();

    modalInit();

    variantDropdown();
}

document.addEventListener('DOMContentLoaded', spotlightProductsInit);


document.addEventListener('shopify:section:load', spotlightProductsInit);

