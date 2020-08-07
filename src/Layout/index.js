import React from 'react';
import { Tools } from '../config/config';
import { Topology, registerNode } from '@topology/core';
import {
  flowData,
  flowDataAnchors,
  flowDataIconRect,
  flowDataTextRect,
  flowSubprocess,
  flowSubprocessIconRect,
  flowSubprocessTextRect,
  flowDb,
  flowDbIconRect,
  flowDbTextRect,
  flowDocument,
  flowDocumentAnchors,
  flowDocumentIconRect,
  flowDocumentTextRect,
  flowInternalStorage,
  flowInternalStorageIconRect,
  flowInternalStorageTextRect,
  flowExternStorage,
  flowExternStorageAnchors,
  flowExternStorageIconRect,
  flowExternStorageTextRect,
  flowQueue,
  flowQueueIconRect,
  flowQueueTextRect,
  flowManually,
  flowManuallyAnchors,
  flowManuallyIconRect,
  flowManuallyTextRect,
  flowDisplay,
  flowDisplayAnchors,
  flowDisplayIconRect,
  flowDisplayTextRect,
  flowParallel,
  flowParallelAnchors,
  flowComment,
  flowCommentAnchors
} from '@topology/flow-diagram';

import {
  activityFinal,
  activityFinalIconRect,
  activityFinalTextRect,
  swimlaneV,
  swimlaneVIconRect,
  swimlaneVTextRect,
  swimlaneH,
  swimlaneHIconRect,
  swimlaneHTextRect,
  fork,
  forkHAnchors,
  forkIconRect,
  forkTextRect,
  forkVAnchors
} from '@topology/activity-diagram';

import {
  simpleClass,
  simpleClassIconRect,
  simpleClassTextRect,
  interfaceClass,
  interfaceClassIconRect,
  interfaceClassTextRect
} from '@topology/class-diagram';

import {
  lifeline,
  lifelineAnchors,
  lifelineIconRect,
  lifelineTextRect,
  sequenceFocus,
  sequenceFocusAnchors,
  sequenceFocusIconRect,
  sequenceFocusTextRect
} from '@topology/sequence-diagram';
import * as FileSaver from 'file-saver';
import { getNodeById } from '../Service/topologyService'
import CanvasProps from './component/canvasProps';
import { useEffect, useContext } from 'react';
import { useState } from 'react';
import { Context } from '../index';
import './index.css'
import { useCallback } from 'react';
let canvas;

const Layout = ({ history }) => {

  const [selected, setSelected] = useState({});

  const { state, dispatch } = useContext(Context);

  const clearEventKey = useCallback(() => {
    dispatch({ type: 'addNode', data: '' });
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", () => clearEventKey());
    window.removeEventListener('popstate', () => clearEventKey());
  }, [clearEventKey]);

  useEffect(() => {
    const canvasOptions = {
      rotateCursor: '/rotate.cur'
    };
    canvasOptions.on = onMessage;
    canvasRegister();
    canvas = new Topology('topology-canvas', canvasOptions);
    if (history.location?.state?.id) {
      async function getNodeData() {
        const data = await getNodeById(history.location.state.id);
        canvas.open(data.data)
      }
      getNodeData();
    }
  }, [history]);


  /**
  * 处理顶部栏的操作
  */

  useEffect(() => {
    clearEventKey();
    switch (state.eventKey) {
      case 'create_new':
        canvas.open({ nodes: [], lines: [] });
        break;
      case 'import_json':
        onHandleImportJson();
        break;
      case 'save_json':
        FileSaver.saveAs(
          new Blob([JSON.stringify(canvas.data)], { type: 'text/plain;charset=utf-8' }),
          `le5le.topology.json`
        );
        break;
      case 'save_png':
        canvas.saveAsImage('le5le.topology.png');
        break;
      case 'save_svg':
        onHandleSaveToSvg();
        break;
      case 'undo':
        canvas.undo();
        break;
      case 'redo':
        canvas.redo();
        break;
      case 'copy':
        canvas.copy();
        break;
      case 'cut':
        canvas.cut();
        break;
      case 'paste':
        canvas.paste();
        break;
      default:
        break;
    }
  }, [state.eventKey])


  /**
  * 导入json文件
  */

  const onHandleImportJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = event => {
      const elem = event.srcElement || event.target;
      if (elem.files && elem.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
          const text = e.target.result + '';
          try {
            const data = JSON.parse(text);
            canvas.open(data);
          } catch (e) {
            return false;
          } finally {

          }
        };
        reader.readAsText(elem.files[0]);
      }
    };
    dispatch({ type: 'addNode', data: '' });
    input.click();
  }

  /**
  * 保存为svg
  */

  const onHandleSaveToSvg = () => {
    const C2S = window.C2S;
    const ctx = new C2S(canvas.canvas.width + 200, canvas.canvas.height + 200);
    if (canvas.data.pens) {
      for (const item of canvas.data.pens) {
        item.render(ctx);
      }
    }
    let mySerializedSVG = ctx.getSerializedSvg();
    mySerializedSVG = mySerializedSVG.replace(
      '<defs/>',
      `<defs>
      <style type="text/css">
        @font-face {
          font-family: 'topology';
          src: url('http://at.alicdn.com/t/font_1331132_h688rvffmbc.ttf?t=1569311680797') format('truetype');
        }
      </style>
    </defs>`
    );
    mySerializedSVG = mySerializedSVG.replace(/--le5le--/g, '&#x');
    const urlObject = window.URL || window;
    const export_blob = new Blob([mySerializedSVG]);
    const url = urlObject.createObjectURL(export_blob);
    const a = document.createElement('a');
    a.setAttribute('download', 'le5le.topology.svg');
    a.setAttribute('href', url);
    const evt = document.createEvent('MouseEvents');
    evt.initEvent('click', true, true);
    a.dispatchEvent(evt);
  }


  /**
  * 注册图形库
  */

  const canvasRegister = () => {
    registerNode('flowData', flowData, flowDataAnchors, flowDataIconRect, flowDataTextRect);
    registerNode('flowSubprocess', flowSubprocess, null, flowSubprocessIconRect, flowSubprocessTextRect);
    registerNode('flowDb', flowDb, null, flowDbIconRect, flowDbTextRect);
    registerNode('flowDocument', flowDocument, flowDocumentAnchors, flowDocumentIconRect, flowDocumentTextRect);
    registerNode(
      'flowInternalStorage',
      flowInternalStorage,
      null,
      flowInternalStorageIconRect,
      flowInternalStorageTextRect
    );
    registerNode(
      'flowExternStorage',
      flowExternStorage,
      flowExternStorageAnchors,
      flowExternStorageIconRect,
      flowExternStorageTextRect
    );
    registerNode('flowQueue', flowQueue, null, flowQueueIconRect, flowQueueTextRect);
    registerNode('flowManually', flowManually, flowManuallyAnchors, flowManuallyIconRect, flowManuallyTextRect);
    registerNode('flowDisplay', flowDisplay, flowDisplayAnchors, flowDisplayIconRect, flowDisplayTextRect);
    registerNode('flowParallel', flowParallel, flowParallelAnchors, null, null);
    registerNode('flowComment', flowComment, flowCommentAnchors, null, null);

    // activity
    registerNode('activityFinal', activityFinal, null, activityFinalIconRect, activityFinalTextRect);
    registerNode('swimlaneV', swimlaneV, null, swimlaneVIconRect, swimlaneVTextRect);
    registerNode('swimlaneH', swimlaneH, null, swimlaneHIconRect, swimlaneHTextRect);
    registerNode('forkH', fork, forkHAnchors, forkIconRect, forkTextRect);
    registerNode('forkV', fork, forkVAnchors, forkIconRect, forkTextRect);

    // class
    registerNode('simpleClass', simpleClass, null, simpleClassIconRect, simpleClassTextRect);
    registerNode('interfaceClass', interfaceClass, null, interfaceClassIconRect, interfaceClassTextRect);

    // sequence
    registerNode('lifeline', lifeline, lifelineAnchors, lifelineIconRect, lifelineTextRect);
    registerNode('sequenceFocus', sequenceFocus, sequenceFocusAnchors, sequenceFocusIconRect, sequenceFocusTextRect);
  }

  /**
  * 监听画布上元素的事件
  * @params {string} event - 事件名称
  * @params {object} data - 节点数据
  */

  const onMessage = (event, data) => {
    switch (event) {
      case 'node':
      case 'addNode':
        setSelected({
          node: data,
          line: null,
          multi: false,
          nodes: null,
          locked: data.locked
        });
        break;

      default:
        break;
    }
  }

  const onDrag = (event, node) => {
    event.dataTransfer.setData('Text', JSON.stringify(node.data));
  }

  /**
  * 当表单数据变化时, 重新渲染canvas
  * @params {object} value - 图形的宽度,高度,长度,宽度
  */

  const onHandleFormValueChange = value => {
    const { rotate, ...other } = value;
    const changedValues = { node: { rect: other, rotate } }
    console.log(changedValues);
    if (changedValues.node) {
      // 遍历查找修改的属性，赋值给原始Node
      for (const key in changedValues.node) {
        if (Array.isArray(changedValues.node[key])) {
        } else if (typeof changedValues.node[key] === 'object') {
          for (const k in changedValues.node[key]) {
            selected.node[key][k] = changedValues.node[key][k];
          }
        } else {
          selected.node[key] = changedValues.node[key];
        }
      }
    }
    canvas.updateProps(selected.node);
  }

  return (
    <div className="page">
      <div className="tool">
        {
          Tools.map((item, index) => <div key={index}>
            <div className="title">{item.group}</div>
            <div className="button">
              {
                item.children.map((item, idx) => {
                  // eslint-disable-next-line jsx-a11y/anchor-is-valid
                  return (<a key={idx} title={item.name} draggable href="#" onDragStart={ev => onDrag(ev, item)}>
                    <i className={'iconfont ' + item.icon} style={{ fontSize: 13 }}>
                    </i>
                  </a>)
                })
              }
            </div>
          </div>)
        }
      </div>
      <div className="full" >
        <svg
          width="100%"
          height="100%"
          style={{
            background: '#fff',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          }}
          xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f3f3f3" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" >

          </rect>
        </svg>
        <div id="topology-canvas" style={{ height: '100%', width: '100%' }} />
      </div>
      <div className="props">
        <CanvasProps data={selected} onFormValueChange={onHandleFormValueChange} />
      </div>
    </div>
  );
};

export default Layout;