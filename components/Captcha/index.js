export default class Captcha extends React.Component {
  blockWidth = 50; // should match the backend
  blockCount = 5; // Should be ODD and match the backend
  captchaUrl = '/api/captcha';

  state = {
    loading: true,
    id: null,
    stripImage: null,
    targetImage:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAlElEQVRoQ+3SwQkAMQzEwLj/op0eBIIQdH8vRHOzu3s++KaHPKaYyGMgJ5FEpAL9WlJYPJsITicdJiKFxbOJ4HTSYSJSWDybCE4nHSYihcWzieB00mEiUlg8mwhOJx0mIoXFs4ngdNJhIlJYPJsITicdJiKFxbOJ4HTSYSJSWDybCE4nHSYihcWzieB00mEiUlg8ewGv1sdrflPqwQAAAABJRU5ErkJggg==', // white square
    index: Math.floor(this.blockCount / 2), //Middle of an odd number with 0 based index
    offsetX: 0
  };
  prevOffsetX = 0;
  mouseDown = null;

  constructor(props) {
    super(props);
  }

  componentWillUnmount() {}

  componentDidMount() {
    this.getCaptcha();
  }

  onTouchStart = e => {
    e.preventDefault();
    e.stopPropagation();
    this.onMouseDown({ clientX: e.targetTouches[0].clientX });
  };

  onTouchEnd = e => {
    e.preventDefault();
    e.stopPropagation();
    this.onMouseUp();
  };

  onTouchMove = e => {
    e.preventDefault();
    e.stopPropagation();
    this.onMouseMove({ clientX: e.targetTouches[0].clientX });
  };

  onMouseDown = e => {
    // this.debug(e, 'mouseDown');

    if (this.state.fail) {
      this.setState({ fail: false });
    }
    this.mouseDown = e.clientX;
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  };

  onMouseUp = e => {
    // this.debug(e, 'mouseUp');
    let offsetX = this.state.offsetX;
    const width = this.blockWidth * Math.floor(this.blockCount / 2);
    const maxOffset = width;
    const minOffset = -width;
    if (offsetX > maxOffset) {
      offsetX = maxOffset;
    }
    if (offsetX < minOffset) {
      offsetX = minOffset;
    }
    const mod = offsetX % this.blockWidth;

    if (Math.abs(mod) < this.blockWidth / 2) {
      offsetX = offsetX - mod;
    } else {
      const sign = mod < 0 ? -1 : 1;
      offsetX = offsetX - mod + this.blockWidth * sign;
    }

    const index = this.calcIndex(offsetX);

    this.setState({ offsetX, index });

    this.prevOffsetX = offsetX;
    this.mouseDown = 0;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  onMouseMove = e => {
    // this.debug(e, 'mouseMove');
    const offsetX = this.prevOffsetX + e.clientX - this.mouseDown;
    this.setState({ offsetX });
  };

  debug = (e, name) => {
    if (!e) e = {};
    console.log(name, e.clientX, e.type);
  };

  onDragStart = e => {
    e.preventDefault();
    return false;
  };

  calcIndex = offset => {
    const temp1 = offset / this.blockWidth;
    const arrayOffset = Math.floor(this.blockCount / 2);
    const index = -1 * temp1 + arrayOffset;

    return index;
  };

  getCaptcha = async () => {
    this.setState({
      loading: true,
      success: false,
      index: Math.floor(this.blockCount / 2)
    });
    this.prevOffsetX = 0;
    const { id, stripImage, targetImage, use } = await (await fetch(
      this.captchaUrl
    )).json();
    console.log(`got captcha`, use);
    this.setState({
      loading: false,
      id,
      use,
      stripImage,
      targetImage,
      offsetX: 0
    });
  };

  submit = async () => {
    const body = {
      id: this.state.id,
      index: this.state.index
    };

    const response = await fetch(this.captchaUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    console.log(`data`, data);

    if (data.success) {
      this.setState({ success: true, fail: false });
    } else {
      this.setState({ success: false, fail: true, message: data.error });
      this.getCaptcha();
    }
  };

  render() {
    // if (this.state.loading) return <div>loading...</div>;

    return (
      <div>
        <div className="captcha-root">
          <p>
            Drag the strip to match the{' '}
            <span className="use">{this.state.use}</span>
          </p>
          {this.state.success ? (
            <div>
              <div>✅ Success</div>
              <p>
                <button onClick={() => this.getCaptcha()}>Again</button>
              </p>
            </div>
          ) : (
            <div>
              {this.state.loading ? (
                <div></div>
              ) : (
                <div id="captcha">
                  <div className="arrow-box">
                    <svg
                      style={{ transform: 'rotate(180deg)', marginTop: '20px' }}
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      viewBox="0 0 97.3 97.3"
                      className="arrow"
                    >
                      <path d="M84 34.5L50 .5a2 2 0 00-2.8 0l-33.9 34a2 2 0 000 2.8l9 9a2 2 0 002.9 0l14.5-14.5v63.5c0 1 1 2 2 2h13.9a2 2 0 002-2V31.8L72 46.3c.7.8 2 .8 2.8 0l9-9a2 2 0 000-2.8z" />
                    </svg>
                  </div>
                  <div
                    className="slide-target"
                    onMouseDown={this.onMouseDown}
                    onTouchStart={this.onTouchStart}
                    onTouchMove={this.onTouchMove}
                    onTouchEnd={this.onTouchEnd}
                    onDragStart={this.onDragStart}
                  >
                    <img src={this.state.targetImage} />
                  </div>
                  <div className="slide-container">
                    <div
                      className="slider"
                      onMouseDown={this.onMouseDown}
                      onTouchStart={this.onTouchStart}
                      onTouchMove={this.onTouchMove}
                      onTouchEnd={this.onTouchEnd}
                      onDragStart={this.onDragStart} // avoid bug
                      // onTouchEnd={e => e.preventDefault()}
                      style={{
                        transform: `translateX(${this.state.offsetX}px)`
                      }}
                    >
                      <img
                        src={this.state.stripImage}
                        className="captcha-image"
                      />
                    </div>
                  </div>
                  <div className="arrow-box">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      viewBox="0 0 97.3 97.3"
                      className="arrow"
                    >
                      <path d="M84 34.5L50 .5a2 2 0 00-2.8 0l-33.9 34a2 2 0 000 2.8l9 9a2 2 0 002.9 0l14.5-14.5v63.5c0 1 1 2 2 2h13.9a2 2 0 002-2V31.8L72 46.3c.7.8 2 .8 2.8 0l9-9a2 2 0 000-2.8z" />
                    </svg>
                  </div>
                  <div>
                    <button onClick={this.submit}>Submit</button>
                    {this.state.fail && (
                      <div className="error">
                        <p>Sorry, try again.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <style jsx>{`
          .captcha-root {
            // border: 1px solid gray;
            padding: 20px;
            text-align: center;
          }
          .use {
            font-size: 18px;
            font-weight: 600;
            text-decoration: underline;
            color: #151515;
          }
          .slide-container {
            margin: 0 auto;

            width: ${this.blockWidth * 5}px;
            overflow: hidden;
          }
          .slide-target {
            width: ${this.blockWidth}px;
            height: ${this.blockWidth}px;
            display: block;
            margin: 0 auto;
          }
          .slide-target::after {
            content: '';
            border-left: 5px solid #58575e;
            position: relative;
            top: -53px;
            left: -2.5px;
            width: 45px;
            height: 95px;
            display: block;
            z-index: 100;
            padding-top: 4px;
            border-right: 5px solid #58575e;
          }
          .arrow-box {
            width: ${this.blockWidth}px;
            height: ${this.blockWidth}px;
            display: block;
            margin: 5px auto;
          }
          .slider {
            // border: 2px solid red;
            height: 50px;
            cursor: grab;
          }
          .error {
            color: red;
          }
          .arrow {
            fill: #d5d1d1;
          }
          button {
            color: #242121;
            border: 1px solid #a4a4a4;
            padding: 10px 20px;
            background-color: #e7e8e7;
            border-radius: 3px;
            font-size: 14px;
            line-height: 14px;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }
}
