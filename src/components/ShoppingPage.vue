<script setup>
import ModalComponentVue from "./ModalComponent.vue";
import axios from "axios";
import { ref, watch, computed, onMounted } from "vue";
import { debounce } from "lodash";
import { Modal } from "bootstrap";
import { useLoading } from "vue-loading-overlay";
const apiUrl = import.meta.env.VITE_API_URL;
const apiPath = import.meta.env.VITE_API_PATH;
const $loading = useLoading({
  color: "green",
  isFullPage: true,
  loader: "bars",
  lockScroll: true,
  opacity: 1,
});
const originData = ref([]);
const pagination = ref({
  totalPageNum: null,
  currentPage: 1,
  displayNum: 5,
});
const cartData = ref([]);
const cartTotalPrice = ref(0);
const cartFinalTotalPrice = ref(0);
const modalTarget = ref({});
const modalTargetQty = ref(null);
const cartItemTarget = ref({});
const orderData = ref({
  user: {
    name: "",
    email: "",
    tel: "",
    address: "",
  },
  message: "",
});
const productModal = ref({});

const showedData = computed(() => {
  return originData.value.filter((item, idx) => {
    let maxItemIdx = pagination.value.currentPage * pagination.value.displayNum;
    let minItemIdx =
      (pagination.value.currentPage - 1) * pagination.value.displayNum;
    return idx < maxItemIdx && idx >= minItemIdx;
  });
});

function getGoodsList() {
  axios.get(`${apiUrl}/v2/api/${apiPath}/products/all`).then((res) => {
    originData.value = res.data.products;
  });
}

function goodsInfoSet(id) {
  modalTarget.value = {};
  showedData.value.find((item) => {
    if (item.id === id) modalTarget.value = item;
  });
}

function paginationFirstSet() {
  pagination.value.totalPageNum = Math.ceil(
    originData.value.length / pagination.value.displayNum
  );
  pagination.value.nextPage = pagination.value.currentPage + 1;
}

function getCartItem() {
  axios.get(`${apiUrl}/v2/api/${apiPath}/cart`).then((res) => {
    cartData.value = {};
    cartData.value = res.data.data.carts;
    cartTotalPrice.value = res.data.data.total;
    cartFinalTotalPrice.value = res.data.data.final_total;
  });
}

function postAddCartItem(id) {
  let qty = modalTargetQty.value ? modalTargetQty.value : 1;
  axios
    .post(`${apiUrl}/v2/api/${apiPath}/cart`, {
      data: {
        product_id: id,
        qty,
      },
    })
    .then((res) => {
      alert(res.data.message);
      getCartItem();
      productModal.value.hide();
    })
    .catch((err) => {
      alert(err.data.message);
    });
}

const putCartItemQty = debounce(() => {
  axios
    .put(`${apiUrl}/v2/api/${apiPath}/cart/${cartItemTarget.value.id}`, {
      data: {
        product_id: cartItemTarget.value.product_id,
        qty: cartItemTarget.value.qty,
      },
    })
    .then(() => {
      getCartItem();
    })
    .catch((err) => {
      alert(err.data.message);
    });
}, 1000);

function deleteCartItem(id) {
  axios
    .delete(`${apiUrl}/v2/api/${apiPath}/cart/${id}`)
    .then((res) => {
      alert(res.data.message);
      getCartItem();
    })
    .catch((err) => {
      alert(err.data.message);
    });
}

function deleteCartAllItem() {
  let deleteConfirm = confirm("????????????????????????");
  if (deleteConfirm) {
    axios
      .delete(`${apiUrl}/v2/api/${apiPath}/carts`)
      .then((res) => {
        alert(res.data.message);
        getCartItem();
      })
      .catch((err) => {
        alert(err.data.message);
      });
  } else {
    return;
  }
}

function postOrder() {
  axios
    .post(`${apiUrl}/v2/api/${apiPath}/order`, {
      data: orderData.value,
    })
    .then((res) => {
      alert(res.data.message);
    })
    .catch((err) => {
      alert(err.data.message);
    });
}

function phoneValidate(value) {
  const phonePattern = /^(09)[0-9]{8}$/;
  if (value === "") {
    return "???????????????";
  } else if (!phonePattern.test(value)) {
    return "?????????????????????????????????";
  } else {
    return true;
  }
}

function emailValidation(value) {
  const emailPattern =
    /^\w+((-\w+)|(\.\w+))*(@)[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  if (value === "") {
    return "?????????????????????";
  } else if (!emailPattern.test(value)) {
    return "???????????????????????????????????????";
  } else {
    return true;
  }
}

onMounted(() => {
  const loader = $loading.show();
  setTimeout(() => {
    loader.hide();
  }, 2000);
  productModal.value = new Modal("#productModal");
});

watch(originData, () => {
  paginationFirstSet();
});

getGoodsList();
getCartItem();
</script>

<template>
  <div class="container">
    <div class="mt-4">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>??????</th>
            <th>????????????</th>
            <th>??????</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="goods in showedData" :key="goods.id">
            <td style="width: 200px">
              <div
                class="goodsImg"
                :style="{ backgroundImage: `url(${goods.imageUrl})` }"
              ></div>
            </td>
            <td>{{ goods.title }}</td>
            <td>
              <del class="h6">?????? {{ goods.origin_price }} ???</del>
              <div class="h5">???????????? {{ goods.price }} ???</div>
            </td>
            <td>
              <div class="btn-group btn-group-sm">
                <button
                  @click.prevent="goodsInfoSet(goods.id)"
                  type="button"
                  class="btn btn-outline-secondary"
                  data-bs-toggle="modal"
                  data-bs-target="#productModal"
                >
                  <font-awesome-icon icon="fa-solid fa-circle-info" />
                  ????????????
                </button>
                <button
                  @click="postAddCartItem(goods.id)"
                  type="button"
                  class="btn btn-outline-danger"
                >
                  <font-awesome-icon icon="fa-solid fa-cart-shopping" />
                  ???????????????
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="d-flex gap-1">
        <button
          @click="pagination.currentPage -= 1"
          type="button"
          class="btn btn-outline-success"
          :disabled="pagination.currentPage - 1 === 0"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-left" />
        </button>
        <button
          v-for="num in pagination.totalPageNum"
          :key="num"
          @click="pagination.currentPage = num"
          type="button"
          class="btn btn-outline-success"
          :disabled="num === pagination.currentPage"
        >
          {{ num }}
        </button>
        <button
          @click="pagination.currentPage += 1"
          type="button"
          class="btn btn-outline-success"
          :disabled="pagination.currentPage + 1 > pagination.totalPageNum"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-right" />
        </button>
      </div>
      <!-- ??????????????? -->
      <div class="text-end">
        <button
          @click="deleteCartAllItem()"
          class="btn btn-outline-danger"
          type="button"
        >
          ???????????????
        </button>
      </div>
      <table class="table align-middle">
        <thead>
          <tr>
            <th></th>
            <th>??????</th>
            <th style="width: 150px">??????/??????</th>
            <th>??????</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="goods in cartData" :key="goods.id">
            <td>
              <button
                @click="deleteCartItem(goods.id)"
                type="button"
                class="btn btn-outline-danger btn-sm"
              >
                x
              </button>
            </td>
            <td>
              {{ goods.product.title }}
              <div class="text-success">??????????????????</div>
            </td>
            <td>
              <div class="input-group input-group-sm">
                <div class="input-group mb-3">
                  <input
                    min="1"
                    type="number"
                    class="form-control"
                    v-model="goods.qty"
                    @change="
                      cartItemTarget = goods;
                      putCartItemQty();
                    "
                  />
                  <span class="input-group-text" id="basic-addon2">{{
                    goods.product.unit
                  }}</span>
                </div>
              </div>
            </td>
            <td class="text-end">
              <small class="text-success">????????????</small>
              {{ goods.product.price }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="text-end">??????</td>
            <td class="text-end">{{ cartTotalPrice }}</td>
          </tr>
          <tr>
            <td colspan="3" class="text-end text-success">?????????</td>
            <td class="text-end text-success">{{ cartFinalTotalPrice }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div class="my-5 row justify-content-center">
      <v-form
        @submit="postOrder()"
        ref="form"
        class="col-md-6"
        v-slot="{ errors }"
      >
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <v-field
            id="email"
            name="customerEmail"
            label="????????????"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': errors['customerEmail'] }"
            v-model="orderData.user.email"
            placeholder="????????? Email"
            :rules="emailValidation"
          ></v-field>
          <error-message
            name="customerEmail"
            class="invalid-feedback"
          ></error-message>
        </div>

        <div class="mb-3">
          <label for="name" class="form-label">???????????????</label>
          <v-field
            id="name"
            name="customerName"
            label="??????"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors['customerName'] }"
            v-model="orderData.user.name"
            placeholder="???????????????"
            rules="required"
          ></v-field>
          <error-message
            name="customerName"
            class="invalid-feedback"
          ></error-message>
        </div>

        <div class="mb-3">
          <label for="tel" class="form-label">???????????????</label>
          <v-field
            id="tel"
            name="customerTel"
            label="??????"
            type="tel"
            class="form-control"
            :class="{ 'is-invalid': errors['customerTel'] }"
            v-model="orderData.user.tel"
            placeholder="???????????????"
            :rules="phoneValidate"
          ></v-field>
          <error-message
            name="customerTel"
            class="invalid-feedback"
          ></error-message>
        </div>

        <div class="mb-3">
          <label for="address" class="form-label">???????????????</label>
          <v-field
            id="address"
            name="customerAddress"
            label="??????"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors['customerAddress'] }"
            v-model="orderData.user.address"
            placeholder="???????????????"
            rules="required"
          ></v-field>
          <error-message
            name="customerAddress"
            class="invalid-feedback"
          ></error-message>
        </div>

        <div class="mb-3">
          <label for="message" class="form-label">??????</label>
          <textarea
            id="message"
            class="form-control"
            v-model="orderData.message"
            cols="30"
            rows="10"
          ></textarea>
        </div>
        <div class="text-end">
          <button type="submit" class="btn btn-danger">????????????</button>
        </div>
      </v-form>
    </div>
  </div>
  <ModalComponentVue
    :modalTarget="modalTarget"
    @send-modal-target-qty="
      (qty) => {
        modalTargetQty = qty;
      }
    "
    @send-add-cart-item="
      (id) => {
        postAddCartItem(id);
      }
    "
  />
</template>

<style scoped>
.goodsImg {
  height: 100px;
  background-size: cover;
  background-position: center;
}
</style>
