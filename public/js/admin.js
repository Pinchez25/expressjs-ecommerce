const deleteProductBtns = document.querySelectorAll('.btn-delete-product');

for (const deleteProductBtn of deleteProductBtns) {
    deleteProductBtn.addEventListener('click', async (e) => {
        // console.log(e.target.dataset.product_id)
        try {
            const productId = e.target.dataset.product_id;
            const productElement = e.target.closest('article');
            const response = await fetch(`/product/${productId}`, {
                method: 'DELETE',
            })
            const data = await response.json();
            console.log(data)
            productElement.remove()
        } catch (e) {
            console.log(e.message)
        }
        // try {
        //     const productId = e.target.dataset.productId;
        // //     const csrfToken = e.target.dataset.csrfToken;
        //     const productElement = e.target.closest('article');
        //     const response = await fetch(`/admin/product/${productId}`, {
        //         method: 'DELETE',
        //         headers: {
        //             'csrf-token': csrfToken,
        //         }
        //     })
        //     const data = await response.json();
        //     console.log(data);
        //     productElement.remove();
        // } catch (err) {
        //     console.error(err);
        // }
    })
}

// deleteProductBtn.addEventListener('click', (e) => {
//     //const productId = e.target.parentNode.querySelector('[name=productId]').value;
//     const productId = e.target.dataset.productId;
//     console.log(productId)
//
// })