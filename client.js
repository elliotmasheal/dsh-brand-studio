window.__ModuleLoader__.load({
  id: 'dsh-brand-studio',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Harness build version reported with account reads (this install's version). */
    const CLIENT_VERSION = '0.2.1-rc.3';
    /** Persisted appearance choices; the version suffix leaves room for migrations. */
    const STORAGE_KEY = 'dsh.custom-brand.v1';
    /** Client locale namespace owned by this plugin. */
    const LOCALE_NS = 'settings.custom-brand';
    /** Shipped name so the author's own setup survives the upgrade. */
    const DEFAULT_NAME = '有彭天地';
    const MAX_NAME = 24;
    const MAX_FILE_BYTES = 20 * 1024 * 1024;
    /** Give the account picture this long to decode before the read counts as failed. */
    const PROFILE_IMAGE_TIMEOUT_MS = 8000;
    /** Accepted `logoSource` values, in display order. */
    const SOURCES = ['account', 'upload', 'official'];
    /** Accepted `logoShape` values, in display order. */
    const SHAPES = ['circle', 'rounded'];
    const DEFAULTS = {
      logoSource: 'account',
      logoShape: 'circle',
      logoImage: '',
      name: DEFAULT_NAME,
      showHarness: false,
    };

    /** Coerce persisted or partial input into a complete, valid choice set. */
    const normalize = (input) => {
      const value = input !== null && typeof input === 'object' ? input : {};
      return {
        logoSource: SOURCES.includes(value.logoSource) ? value.logoSource : DEFAULTS.logoSource,
        logoShape: SHAPES.includes(value.logoShape) ? value.logoShape : DEFAULTS.logoShape,
        logoImage: typeof value.logoImage === 'string' ? value.logoImage : DEFAULTS.logoImage,
        name: typeof value.name === 'string' ? value.name.slice(0, MAX_NAME) : DEFAULTS.name,
        showHarness: typeof value.showHarness === 'boolean' ? value.showHarness : DEFAULTS.showHarness,
      };
    };

    /** Read the saved choices; a broken or missing record falls back to the defaults. */
    const loadSettings = () => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw === null ? normalize(DEFAULTS) : normalize(JSON.parse(raw));
      } catch (_error) {
        return normalize(DEFAULTS);
      }
    };

    /** Write the choices; false means the browser refused (quota or private mode). */
    const saveSettings = (value) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        return true;
      } catch (_error) {
        return false;
      }
    };

    /** Read a picked file as a data URL. */
    const readAsDataUrl = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('read failed'));
        reader.readAsDataURL(file);
      });

    /** Decode a data URL into an image element. */
    const decodeImage = (url) =>
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('decode failed'));
        image.src = url;
      });

    /** Centre-crop a picked picture into a small square data URL. */
    const compress = async (file, side = 192) => {
      if (file.size > MAX_FILE_BYTES) throw new Error('too large');
      const image = await decodeImage(await readAsDataUrl(file));
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      const canvas = document.createElement('canvas');
      canvas.width = side;
      canvas.height = side;
      const context = canvas.getContext('2d');
      if (context === null) throw new Error('canvas unavailable');
      const edge = Math.min(width, height);
      context.drawImage(image, (width - edge) / 2, (height - edge) / 2, edge, edge, 0, 0, side, side);
      const webp = canvas.toDataURL('image/webp', 0.92);
      return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/png');
    };

    /** Resolve once the browser knows whether it can paint the account picture;
     *  a stalled request settles as a failure instead of blocking the retry loop. */
    const preload = (url) =>
      new Promise((resolve) => {
        const image = new Image();
        image.referrerPolicy = 'no-referrer';
        let timer = 0;
        const settle = (loaded) => {
          window.clearTimeout(timer);
          resolve(loaded);
        };
        timer = window.setTimeout(() => settle(false), PROFILE_IMAGE_TIMEOUT_MS);
        image.onload = () => settle(true);
        image.onerror = () => settle(false);
        image.src = url;
      });

    /** Theme-driven styles for the General settings rows owned by this plugin. */
    const PAGE_CSS = `.dshcb-row{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:16px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.dshcb-copy{min-width:0}
.dshcb-title{color:var(--dsw-alias-label-primary);font-size:14px;line-height:20px}
.dshcb-desc{color:var(--dsw-alias-label-secondary);margin-top:4px;font-size:12px;line-height:18px}
.dshcb-desc-error{color:var(--dsw-alias-state-error-primary)}
.dshcb-control{display:flex;align-items:center;gap:8px;flex:none}
.dshcb-choice{display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:flex-end}
.dshcb-option{display:inline-flex;align-items:center;gap:6px;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px;cursor:pointer}
.dshcb-option input{accent-color:var(--dsw-alias-brand-primary);margin:0}
.dshcb-btn{box-sizing:border-box;height:28px;padding:0 10px;border-radius:var(--dsw-radius-md);border:.5px solid var(--dsw-alias-border-l2);background:0 0;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer;white-space:nowrap}
.dshcb-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dshcb-btn:disabled{color:var(--dsw-alias-label-tertiary);border-color:var(--dsw-alias-border-l1);cursor:default}
.dshcb-input{box-sizing:border-box;width:200px;height:32px;padding:0 10px;border-radius:var(--dsw-radius-md);border:.5px solid var(--dsw-alias-border-l2);background:0 0;color:inherit;font:inherit;font-size:13px}
.dshcb-input::placeholder{color:var(--dsw-alias-label-tertiary)}
.dshcb-input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dshcb-mark{width:32px;height:32px;flex:none;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;background:var(--dsw-alias-bg-skeleton);color:var(--dsw-alias-label-tertiary);font-size:11px}
.dshcb-mark img{width:100%;height:100%;object-fit:cover;display:block}`;

    const EN = {
      source: 'Logo',
      sourceDesc: 'Which picture the sidebar brand shows.',
      sourceAccount: 'Account avatar',
      sourceUpload: 'Uploaded image',
      sourceOfficial: 'Official mark',
      shape: 'Logo shape',
      shapeDesc: 'Circle or rounded square.',
      shapeCircle: 'Circle',
      shapeRounded: 'Rounded square',
      image: 'Logo image',
      imageDesc: 'Picked pictures are centre-cropped square and stored on this device.',
      imageReady: 'Stored on this device.',
      imageLocked: 'Switch the logo source to “Uploaded image” to change this picture.',
      pick: 'Choose image',
      busy: 'Processing…',
      remove: 'Remove',
      official: 'Official',
      accountSignedOut: 'Sign in to a DeepSeek account to choose its avatar.',
      accountNoAvatar: 'This account has no profile picture.',
      accountSignInRequired: 'Only available while signed in to a DeepSeek account.',
      name: 'Brand name',
      nameHint: 'Leave empty to use the official wordmark, DeepSeek Harness.',
      namePlaceholder: 'DeepSeek',
      resetName: 'Use official',
      harness: 'Harness badge',
      harnessHint: 'Shows the official Harness badge after the custom name.',
      harnessLocked: 'Always shown with the official wordmark.',
      harnessShow: 'Show “Harness”',
      imageType: 'Choose an image file.',
      imageFailed: 'That image could not be processed. Try another one.',
      storage: 'Could not save: local storage is full.',
    };

    const ZH = {
      source: 'Logo 来源',
      sourceDesc: '决定侧边栏左上角显示哪张图。',
      sourceAccount: '已登录账号头像',
      sourceUpload: '上传的图片',
      sourceOfficial: '官方标志',
      shape: 'Logo 形状',
      shapeDesc: '纯圆或圆角矩形。',
      shapeCircle: '纯圆',
      shapeRounded: '圆角矩形',
      image: 'Logo 图片',
      imageDesc: '选图后会居中裁成方形并保存在本机。',
      imageReady: '已保存在本机。',
      imageLocked: '把 Logo 来源切换为「上传的图片」后才能更换。',
      pick: '选择图片',
      busy: '处理中…',
      remove: '移除',
      official: '官方',
      accountSignedOut: '未登录 DeepSeek 官方账号，账号头像不可选。',
      accountNoAvatar: '当前账号没有设置头像。',
      accountSignInRequired: '仅在登录 DeepSeek 官方账号后可用。',
      name: '品牌名称',
      nameHint: '留空则使用官方字标（DeepSeek Harness）。',
      namePlaceholder: 'DeepSeek',
      resetName: '恢复官方',
      harness: 'Harness 徽标',
      harnessHint: '在自定义名称后追加官方的 Harness 徽标。',
      harnessLocked: '使用官方名称时固定显示。',
      harnessShow: '显示「Harness」',
      imageType: '请选择图片文件。',
      imageFailed: '这张图片无法处理，请换一张。',
      storage: '保存失败：本地存储空间不足。',
    };

    /** Official "HARNESS" badge geometry, lifted from the shipped wordmark SVG. */
    const HARNESS_GLYPHS = [
      'M132.848 8.93205H134.08V16.137H132.848V8.93205ZM136.5 8.93205H137.732V16.137H136.5V8.93205ZM133.365 13.024V11.99H137.193V13.024H133.365Z',
      'M140.397 14.432L140.672 13.453H143.202L143.532 14.432H140.397ZM140.287 16.137H139.055L141.277 8.93205H142.201L142.146 9.74605L140.947 13.915H140.969L140.287 16.137ZM145.039 16.137H143.741L143.07 13.948L143.081 13.937L141.871 9.74605L141.926 8.93205H142.817L145.039 16.137Z',
      'M146.846 8.93205H149.068C149.852 8.93205 150.443 9.11538 150.839 9.48205C151.235 9.84138 151.433 10.3327 151.433 10.956C151.433 11.22 151.396 11.4657 151.323 11.693C151.249 11.9204 151.125 12.1257 150.949 12.309C150.773 12.4924 150.531 12.65 150.223 12.782C149.922 12.9067 149.541 13.0057 149.079 13.079V13.321H146.846V12.639L148.023 12.485C148.631 12.4044 149.09 12.298 149.398 12.166C149.706 12.034 149.915 11.8764 150.025 11.693C150.135 11.5024 150.19 11.2934 150.19 11.066C150.19 10.6994 150.083 10.417 149.871 10.219C149.658 10.021 149.324 9.92205 148.87 9.92205H146.846V8.93205ZM146.395 8.93205H147.627V16.137H146.395V8.93205ZM151.917 16.093V16.137H150.366L149.024 14.322C148.87 14.1094 148.73 13.9407 148.606 13.816C148.481 13.684 148.345 13.5887 148.199 13.53C148.052 13.464 147.872 13.42 147.66 13.398C147.447 13.3687 147.176 13.3504 146.846 13.343V13.145H149.079C149.233 13.211 149.368 13.2844 149.486 13.365C149.61 13.4457 149.735 13.5447 149.86 13.662C149.992 13.7794 150.138 13.937 150.3 14.135L151.917 16.093Z',
      'M153.58 9.57005L153.591 8.93205H154.46L157.584 15.51V16.137H156.704L153.58 9.57005ZM158.024 16.137H156.968L156.88 8.93205H158.024V16.137ZM154.24 16.137H153.096V8.93205H154.152L154.24 16.137Z',
      'M159.963 8.93205H161.206V16.137H159.963V8.93205ZM160.095 9.96605V8.93205H164.858V9.96605H160.095ZM160.095 16.137V15.103H164.902V16.137H160.095ZM160.095 13.013V11.99H164.374V13.013H160.095Z',
      'M169.052 15.257C169.543 15.257 169.895 15.1654 170.108 14.982C170.328 14.7987 170.438 14.5457 170.438 14.223C170.438 14.047 170.405 13.8967 170.339 13.772C170.273 13.6474 170.152 13.5337 169.976 13.431C169.807 13.321 169.558 13.2147 169.228 13.112L168.491 12.881C167.846 12.6757 167.38 12.4044 167.094 12.067C166.808 11.7297 166.665 11.3007 166.665 10.78C166.665 10.428 166.76 10.1017 166.951 9.80105C167.142 9.50038 167.428 9.25838 167.809 9.07505C168.19 8.89172 168.663 8.80005 169.228 8.80005C169.631 8.80005 169.998 8.82938 170.328 8.88805C170.665 8.93938 171.039 9.01638 171.45 9.11905L171.274 10.175C170.834 10.0504 170.442 9.96238 170.097 9.91105C169.76 9.85238 169.463 9.82305 169.206 9.82305C168.737 9.82305 168.403 9.90738 168.205 10.076C168.007 10.2374 167.908 10.439 167.908 10.681C167.908 10.857 167.941 11.0147 168.007 11.154C168.073 11.286 168.19 11.407 168.359 11.517C168.535 11.627 168.784 11.7334 169.107 11.836L169.866 12.078C170.526 12.276 170.995 12.5327 171.274 12.848C171.553 13.156 171.692 13.585 171.692 14.135C171.692 14.5604 171.589 14.9344 171.384 15.257C171.179 15.5797 170.878 15.8327 170.482 16.016C170.093 16.1994 169.609 16.291 169.03 16.291C168.627 16.291 168.212 16.247 167.787 16.159C167.362 16.071 166.9 15.9427 166.401 15.774L166.665 14.718C167.156 14.894 167.6 15.0297 167.996 15.125C168.399 15.213 168.751 15.257 169.052 15.257Z',
      'M175.809 15.257C176.3 15.257 176.652 15.1654 176.865 14.982C177.085 14.7987 177.195 14.5457 177.195 14.223C177.195 14.047 177.162 13.8967 177.096 13.772C177.03 13.6474 176.909 13.5337 176.733 13.431C176.564 13.321 176.315 13.2147 175.985 13.112L175.248 12.881C174.603 12.6757 174.137 12.4044 173.851 12.067C173.565 11.7297 173.422 11.3007 173.422 10.78C173.422 10.428 173.517 10.1017 173.708 9.80105C173.899 9.50038 174.185 9.25838 174.566 9.07505C174.947 8.89172 175.42 8.80005 175.985 8.80005C176.388 8.80005 176.755 8.82938 177.085 8.88805C177.422 8.93938 177.796 9.01638 178.207 9.11905L178.031 10.175C177.591 10.0504 177.199 9.96238 176.854 9.91105C176.517 9.85238 176.22 9.82305 175.963 9.82305C175.494 9.82305 175.16 9.90738 174.962 10.076C174.764 10.2374 174.665 10.439 174.665 10.681C174.665 10.857 174.698 11.0147 174.764 11.154C174.83 11.286 174.947 11.407 175.116 11.517C175.292 11.627 175.541 11.7334 175.864 11.836L176.623 12.078C177.283 12.276 177.752 12.5327 178.031 12.848C178.31 13.156 178.449 13.585 178.449 14.135C178.449 14.5604 178.346 14.9344 178.141 15.257C177.936 15.5797 177.635 15.8327 177.239 16.016C176.85 16.1994 176.366 16.291 175.787 16.291C175.384 16.291 174.969 16.247 174.544 16.159C174.119 16.071 173.657 15.9427 173.158 15.774L173.422 14.718C173.913 14.894 174.357 15.0297 174.753 15.125C175.156 15.213 175.508 15.257 175.809 15.257Z',
    ];

    /**
     * The shipped wordmark's trailing "HARNESS" badge, rebuilt from the same
     * geometry: a pill in the label colour with inverted letters clipped inside.
     * @param props - `height` is the rendered pixel height of the pill.
     */
    function HarnessBadge({ height }) {
      const scale = height / 14;
      return h(
        'svg',
        {
          viewBox: '129.348 5.5 52 14',
          width: 52 * scale,
          height,
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block', flex: 'none' },
        },
        h('rect', { x: 129.348, y: 5.5, width: 52, height: 14, rx: 2, fill: 'currentColor' }),
        h(
          'g',
          { clipPath: 'url(#dsh-brand-studio-harness)', fill: 'var(--dsw-alias-label-primary-inverted)' },
          HARNESS_GLYPHS.map((d, index) => h('path', { key: index, d })),
        ),
        h(
          'defs',
          null,
          h(
            'clipPath',
            { id: 'dsh-brand-studio-harness' },
            h('rect', { x: 132.348, y: 5.5, width: 46, height: 14 }),
          ),
        ),
      );
    }

    /** Theme applies `corner-shape: superellipse(1.5)` to everything; circles opt back in. */
    const roundCorners = (node) => {
      if (node) node.style.setProperty('corner-shape', 'round');
    };

    return {
      inject: ['slots', 'locale', 'remote', 'remote.account'],
      apply(ctx) {
        // ------------------------------------------------------------------
        // Preferences: one snapshot drives both the brand slots and the page.
        // ------------------------------------------------------------------
        const listeners = new Set();
        let persisted = loadSettings();
        let accountAvatar = '';
        let signedIn = false;
        let snap = buildSnapshot();

        function buildSnapshot() {
          return { ...persisted, accountAvatar, accountSignedIn: signedIn };
        }
        function emit() {
          for (const listener of [...listeners]) listener();
        }
        function refresh() {
          snap = buildSnapshot();
          emit();
        }
        function subscribe(listener) {
          listeners.add(listener);
          return () => listeners.delete(listener);
        }
        function getSnapshot() {
          return snap;
        }
        const useSnapshot = () => React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

        /** Merge one change, persist it, and notify the slots and page. */
        function change(patch) {
          persisted = normalize({ ...persisted, ...patch });
          const stored = saveSettings(persisted);
          refresh();
          return stored;
        }

        /** The picture the mark seat should show, or '' when the official mark owns it. */
        const effectiveLogo = (value) => {
          if (value.logoSource === 'upload') return value.logoImage;
          if (value.logoSource === 'account') return value.accountAvatar;
          return '';
        };

        /** Square geometry for both the sidebar cell and the page preview. */
        const markGeometry = (cell, shape) => {
          // Two pixels smaller than the cell: the Windows caption layout nudges
          // the whole brand identity down 1px inside a clipped 24px row, and this
          // inset absorbs that nudge, so the picture never touches the clip edge
          // and keeps the same centre line as the name and the Harness badge.
          const diameter = Math.max(cell - 2, 12);
          const circle = shape === 'circle';
          return {
            style: {
              width: diameter,
              height: diameter,
              display: 'block',
              flex: 'none',
              objectFit: 'cover',
              borderRadius: circle ? '50%' : '28%',
              background: 'var(--dsw-alias-bg-skeleton)',
            },
            ref: circle ? roundCorners : undefined,
          };
        };

        // ------------------------------------------------------------------
        // Sidebar occupants
        // ------------------------------------------------------------------
        function CustomMark({ size }) {
          const state = useSnapshot();
          const url = effectiveLogo(state);
          if (url === '') return null;
          const geometry = markGeometry(typeof size === 'number' ? size : 24, state.logoShape);
          return h('img', {
            src: url,
            alt: '',
            draggable: false,
            referrerPolicy: 'no-referrer',
            ref: geometry.ref,
            style: geometry.style,
          });
        }

        /** The official wordmark is one picture that already spells
         *  "DeepSeek Harness", so an empty name always defers to it. */
        const usesOfficialWordmark = (value) => value.name.trim() === '';

        function CustomName() {
          const state = useSnapshot();
          return h(
            'span',
            {
              style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'inherit',
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: '0.02em',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
              },
            },
            state.name.trim(),
            state.showHarness ? h(HarnessBadge, { height: 14 }) : null,
          );
        }

        let markRegistration;
        let nameRegistration;

        /** Occupy each brand seat only while a replacement exists, so the
         *  shipped mark/wordmark returns for the official choices. */
        const ensureOccupants = () => {
          const wantsMark = effectiveLogo(snap) !== '';
          if (wantsMark && markRegistration === undefined) {
            markRegistration = ctx.slots.inject('sidebar.brand.mark', () =>
              ctx.slots.register({ name: 'sidebar.brand.mark', priority: -1 }, CustomMark),
            );
          } else if (!wantsMark && markRegistration !== undefined) {
            markRegistration();
            markRegistration = undefined;
          }

          // The official wordmark already reads "DeepSeek Harness"; leaving it in
          // place keeps the shipped logotype instead of re-typesetting it.
          const wantsName = !usesOfficialWordmark(snap);
          if (wantsName && nameRegistration === undefined) {
            nameRegistration = ctx.slots.inject('sidebar.brand.name', () =>
              ctx.slots.register({ name: 'sidebar.brand.name', priority: -1 }, CustomName),
            );
          } else if (!wantsName && nameRegistration !== undefined) {
            nameRegistration();
            nameRegistration = undefined;
          }
        };

        ctx.effect(() => {
          const off = subscribe(ensureOccupants);
          ensureOccupants();
          return () => {
            off();
            markRegistration?.();
            nameRegistration?.();
            markRegistration = undefined;
            nameRegistration = undefined;
          };
        }, 'brand studio: brand slots');

        // ------------------------------------------------------------------
        // Settings rows: Settings → General
        // ------------------------------------------------------------------
        /** Latest picture-picker opener, so the source row can focus that input. */
        let pickImage = () => {};

        /** One labelled row in the General column, matching its hairlines. */
        const row = (title, description, control, options) =>
          h(
            'div',
            { className: 'dshcb-row' },
            h(
              'div',
              { className: 'dshcb-copy' },
              h('div', { className: 'dshcb-title' }, title),
              description === '' || description === null || description === undefined
                ? null
                : h(
                    'div',
                    { className: options && options.danger ? 'dshcb-desc dshcb-desc-error' : 'dshcb-desc' },
                    description,
                  ),
            ),
            h('div', { className: 'dshcb-control' }, control),
          );

        /** One radio option inside a row's control cluster. */
        const radio = (group, value, current, label, disabled, onSelect) =>
          h(
            'label',
            {
              className: 'dshcb-option',
              key: group + ':' + value,
              title: disabled ? t('accountSignInRequired') : undefined,
              style: disabled === true ? { opacity: 0.45, cursor: 'default' } : undefined,
            },
            h('input', {
              type: 'radio',
              name: 'dshcb-' + group,
              checked: current === value,
              disabled: disabled === true,
              onChange: () => onSelect(value),
            }),
            h('span', null, label),
          );

        function BrandSourceRow() {
          const state = useSnapshot();
          const signedIn = state.accountSignedIn;
          const description = !signedIn
            ? t('accountSignedOut')
            : state.logoSource === 'account' && state.accountAvatar === ''
              ? t('accountNoAvatar')
              : t('sourceDesc');
          const select = (value) => {
            change({ logoSource: value });
            if (value === 'upload' && state.logoImage === '') pickImage();
          };
          return row(
            t('source'),
            description,
            h(
              'div',
              { className: 'dshcb-choice' },
              radio('logoSource', 'account', state.logoSource, t('sourceAccount'), !signedIn, select),
              radio('logoSource', 'upload', state.logoSource, t('sourceUpload'), false, select),
              radio('logoSource', 'official', state.logoSource, t('sourceOfficial'), false, select),
            ),
          );
        }

        function BrandShapeRow() {
          const state = useSnapshot();
          const select = (value) => change({ logoShape: value });
          return row(
            t('shape'),
            t('shapeDesc'),
            h(
              'div',
              { className: 'dshcb-choice' },
              radio('logoShape', 'circle', state.logoShape, t('shapeCircle'), false, select),
              radio('logoShape', 'rounded', state.logoShape, t('shapeRounded'), false, select),
            ),
          );
        }

        function BrandImageRow() {
          const state = useSnapshot();
          const [error, setError] = React.useState('');
          const [busy, setBusy] = React.useState(false);
          const fileInput = React.useRef(null);
          const editable = state.logoSource === 'upload';
          const logo = effectiveLogo(state);
          const circle = state.logoShape === 'circle';

          React.useEffect(() => {
            pickImage = () => fileInput.current?.click();
            return () => {
              pickImage = () => {};
            };
          }, []);

          const applyChange = (patch) => setError(change(patch) ? '' : t('storage'));

          const onFile = async (event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;
            if (!file.type.startsWith('image/')) {
              setError(t('imageType'));
              return;
            }
            setBusy(true);
            try {
              const dataUrl = await compress(file);
              applyChange({ logoImage: dataUrl, logoSource: 'upload' });
            } catch (_error) {
              setError(t('imageFailed'));
            } finally {
              setBusy(false);
            }
          };

          const description =
            error !== ''
              ? error
              : !editable
                ? t('imageLocked')
                : state.logoImage === ''
                  ? t('imageDesc')
                  : t('imageReady');

          return row(
            t('image'),
            description,
            h(
              'div',
              { className: 'dshcb-control' },
              h(
                'span',
                {
                  className: 'dshcb-mark',
                  style: { borderRadius: circle ? '50%' : '28%' },
                  ref: circle ? roundCorners : undefined,
                },
                logo === '' ? h('span', null, t('official')) : h('img', { src: logo, alt: '' }),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dshcb-btn',
                  disabled: busy || !editable,
                  onClick: () => fileInput.current?.click(),
                },
                busy ? t('busy') : t('pick'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dshcb-btn',
                  disabled: !editable || state.logoImage === '',
                  onClick: () => applyChange({ logoImage: '', logoSource: 'official' }),
                },
                t('remove'),
              ),
              h('input', {
                ref: fileInput,
                type: 'file',
                accept: 'image/*',
                style: { display: 'none' },
                onChange: onFile,
              }),
            ),
            error === '' ? undefined : { danger: true },
          );
        }

        function BrandNameRow() {
          const state = useSnapshot();
          return row(
            t('name'),
            t('nameHint'),
            h(
              'div',
              { className: 'dshcb-control' },
              h('input', {
                className: 'dshcb-input',
                type: 'text',
                value: state.name,
                maxLength: MAX_NAME,
                placeholder: t('namePlaceholder'),
                onChange: (event) => change({ name: event.target.value }),
              }),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dshcb-btn',
                  disabled: state.name === '',
                  onClick: () => change({ name: '' }),
                },
                t('resetName'),
              ),
            ),
          );
        }

        function BrandHarnessRow() {
          const state = useSnapshot();
          const locked = state.name.trim() === '';
          return row(
            t('harness'),
            locked ? t('harnessLocked') : t('harnessHint'),
            h(
              'label',
              {
                className: 'dshcb-option',
                style: locked ? { opacity: 0.45, cursor: 'default' } : undefined,
              },
              h('input', {
                type: 'checkbox',
                checked: locked || state.showHarness,
                disabled: locked,
                onChange: (event) => change({ showHarness: event.target.checked }),
              }),
              h('span', null, t('harnessShow')),
            ),
          );
        }

        ctx.effect(() => ctx.locale.register(LOCALE_NS, { en: EN, zh: ZH }), 'brand studio: dictionaries');
        const t = ctx.locale.bind(LOCALE_NS);
        ctx.slots.inject('settings.general.item', () => {
          const definitions = [
            ['brand-logo-source', 40, BrandSourceRow],
            ['brand-logo-shape', 41, BrandShapeRow],
            ['brand-logo-image', 42, BrandImageRow],
            ['brand-name', 43, BrandNameRow],
            ['brand-harness', 44, BrandHarnessRow],
          ];
          const disposers = definitions.map(([id, order, component]) =>
            ctx.slots.register({ name: 'settings.general.item', id, order }, component),
          );
          return () => {
            for (const dispose of disposers) dispose();
          };
        });

        ctx.effect(() => {
          const tag = document.createElement('style');
          tag.dataset.plugin = 'dsh-brand-studio';
          tag.textContent = PAGE_CSS;
          document.head.appendChild(tag);
          return () => tag.remove();
        }, 'brand studio: page styles');

        // ------------------------------------------------------------------
        // Account picture: the same sanctioned Remote read the account page uses.
        // ------------------------------------------------------------------
        const client = () => ({
          version: CLIENT_VERSION,
          locale: ctx.locale.getSnapshot().active,
          timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
        });

        /** Attempts per burst; a later account frame, focus, or reconnect starts a new burst. */
        const MAX_PROFILE_ATTEMPTS = 8;
        /** One in-flight read, its retry schedule, and the credential it belongs to. */
        let profilePending = false;
        let profileAttempt = 0;
        let profileRetryTimer = 0;
        let profileEpoch = 0;

        /** Cancel a queued retry. */
        const stopProfileRetry = () => {
          if (profileRetryTimer !== 0) {
            window.clearTimeout(profileRetryTimer);
            profileRetryTimer = 0;
          }
        };

        /** Queue the next read after a failure, backing off to 30 s. */
        const scheduleProfileRetry = () => {
          if (!signedIn || profileRetryTimer !== 0 || profileAttempt >= MAX_PROFILE_ATTEMPTS) return;
          const delay = Math.min(1200 * 2 ** profileAttempt, 30_000);
          profileAttempt += 1;
          profileRetryTimer = window.setTimeout(() => {
            profileRetryTimer = 0;
            loadProfile();
          }, delay);
        };

        /** Read the signed-in account picture: an absent avatar settles, a failure retries. */
        const loadProfile = async () => {
          if (!signedIn || profilePending) return;
          const epoch = profileEpoch;
          profilePending = true;
          try {
            const result = await ctx.remote.account.getProfile(client());
            if (epoch !== profileEpoch || !signedIn) return;
            if (!result.ok || result.value?.status !== 'ready') {
              scheduleProfileRetry();
              return;
            }
            const url = result.value.value.avatarUrl;
            if (typeof url !== 'string' || url === '') {
              // The read settled: this account has no picture to show.
              profileAttempt = 0;
              stopProfileRetry();
              if (accountAvatar !== '') {
                accountAvatar = '';
                refresh();
              }
              return;
            }
            const loaded = await preload(url);
            if (epoch !== profileEpoch || !signedIn) return;
            if (!loaded) {
              scheduleProfileRetry();
              return;
            }
            profileAttempt = 0;
            stopProfileRetry();
            if (accountAvatar !== url) {
              accountAvatar = url;
              refresh();
            }
          } catch (_error) {
            scheduleProfileRetry();
          } finally {
            profilePending = false;
            if (signedIn && epoch !== profileEpoch) scheduleProfileRetry();
          }
        };

        /** Read again on a fresh chance to succeed: an account frame, refocus, or reconnect. */
        const probeProfile = () => {
          if (!signedIn) return;
          profileAttempt = 0;
          stopProfileRetry();
          loadProfile();
        };

        const stream = ctx.remote.$stream({
          name: 'account',
          open: (signal) => ctx.remote.account.watch(signal),
          ended: () => new Error('account stream ended'),
        });
        ctx.effect(() => () => stream.dispose(), 'brand studio: account stream');

        (async () => {
          try {
            for await (const frame of stream) {
              frame.accept?.();
              const next = frame.value?.status === 'credential-stored';
              if (next !== signedIn) {
                signedIn = next;
                if (!next) {
                  // Drop the previous credential's picture and any retry against it.
                  profileEpoch += 1;
                  profileAttempt = 0;
                  stopProfileRetry();
                  accountAvatar = '';
                }
                refresh();
              }
              if (next) probeProfile();
            }
          } catch (_error) {
            // Keep the last known picture; the settings page shows the state.
          }
        })();

        (async () => {
          try {
            const result = await ctx.remote.account.getState();
            if (result.ok && result.value?.status === 'credential-stored' && !signedIn) {
              signedIn = true;
              refresh();
              probeProfile();
            }
          } catch (_error) {
            // Signed out or offline: the official mark stays available.
          }
        })();

        // A read that failed while the window was hidden or offline gets another
        // burst as soon as the user is back, so the picture never stays missing.
        ctx.effect(() => {
          const retryWhenReachable = () => {
            if (signedIn && accountAvatar === '') probeProfile();
          };
          const onVisibility = () => {
            if (document.visibilityState === 'visible') retryWhenReachable();
          };
          document.addEventListener('visibilitychange', onVisibility);
          window.addEventListener('online', retryWhenReachable);
          return () => {
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('online', retryWhenReachable);
          };
        }, 'brand studio: account picture recovery');
      },
    };
  },
});
