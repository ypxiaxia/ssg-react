import Swal from 'sweetalert2';

export interface KefuItem {
  kefu_name: string;
  kefu_url: string;
  kefu_icon?: string;
}

export const openKefuSelector = async (kefuList: KefuItem[], title: string) => {
  if (!Array.isArray(kefuList) || kefuList.length === 0) {
    await Swal.fire({
      title,
      text: 'No customer service available.',
      icon: 'info',
      confirmButtonColor: '#000000',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'rounded-[2rem]',
        confirmButton: 'rounded-xl px-8 py-3 font-bold',
      },
    });
    return;
  }

  const optionsHtml = kefuList
    .map(
      (item, index) => `
      <button
        type="button"
        class="kefu-option"
        data-index="${index}"
        style="width:100%;padding:12px 14px;border:1px solid #E5E7EB;border-radius:12px;background:#fff;font-weight:700;text-align:left;cursor:pointer;display:flex;align-items:center;gap:10px;"
      >
        ${
          item.kefu_icon
            ? `<img src="${item.kefu_icon}" alt="${item.kefu_name || 'kefu'}" style="width:28px;height:28px;border-radius:9999px;object-fit:cover;flex-shrink:0;" />`
            : `<span style="width:28px;height:28px;border-radius:9999px;background:#111;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;">${(item.kefu_name || 'K').charAt(0).toUpperCase()}</span>`
        }
        <span>${item.kefu_name || 'Customer Service'}</span>
      </button>
    `
    )
    .join('');

  await Swal.fire({
    title,
    html: `<div style="display:flex;flex-direction:column;gap:10px;">${optionsHtml}</div>`,
    showConfirmButton: false,
    showCloseButton: true,
    customClass: {
      popup: 'rounded-[2rem]',
      closeButton: 'text-gray-400',
    },
    didOpen: () => {
      const buttons = Swal.getPopup()?.querySelectorAll<HTMLButtonElement>('.kefu-option') || [];
      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          const index = Number(button.dataset.index);
          const target = kefuList[index];
          if (target?.kefu_url) {
            window.open(target.kefu_url, '_blank', 'noopener,noreferrer');
            Swal.close();
          }
        });
      });
    },
  });
};
