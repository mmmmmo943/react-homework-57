import './styles.scss';
import dayjs from 'dayjs'
import Selecto from "selecto"
import { Popover } from 'antd';
import { useState, useEffect, useRef } from 'react';



function App() {
  const [selectedList, setSelectedList] = useState([])
// 辅助函数，将“星期几”的字符串映射到一个数值
const dayToNum = (day) => {
  const days = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
  return days.indexOf(day) + 1;
};
// 辅助函数，将数组中的连续数字分组
const groupContinuousNumbers = (nums) => {
  if (nums.length === 0) return [];
  nums.sort((a, b) => a - b);

  let result = [[nums[0]]];

  for (let i = 1; i < nums.length; i++) {
      if (nums[i] - nums[i - 1] === 1) {
          result[result.length - 1].push(nums[i]);
      } else {
          result.push([nums[i]]);
      }
  }

  return result.map(r => r.length === 1 ? r[0] : r);
}
// 辅助函数，将num字段的值转换成时间段字符串
const numToTime = (num) => {
  let baseTime = dayjs().startOf('day');
  let startTime = baseTime.add(num * 30, 'minute');
  return startTime.format('HH:mm');
};

// 处理selectedList数组
const processSelectedList = (selectedList) => {
  // 按照星期一至星期日的顺序排序selectedList数组
  selectedList.sort((a, b) => dayToNum(a.weekday) - dayToNum(b.weekday));

  // 将selectedList数组按照weekday字段的值分组
  const groupedByDay = selectedList.reduce((acc, cur) => {
    const day = cur.weekday;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(cur);
    return acc;
  }, {});

  // 处理分组后的数组
  const result = Object.entries(groupedByDay).map(([day, items]) => {
    // 提取num字段的值，并进行分组
    let nums = items.map(item => item.num);
    nums = groupContinuousNumbers(nums);
    
    // 将num字段的值转换成时间段字符串
    let list = nums.map(numGroup => {
      if (Array.isArray(numGroup)) {
        let start = numToTime(numGroup[0]);
        let end = numToTime(numGroup[numGroup.length - 1] + 1);
        return `${start}-${end}`;
      } else {
        let start = numToTime(numGroup);
        let end = numToTime(numGroup + 1);
        return `${start}-${end}`;
      }
    });

    return {
      day: day,
      list: list
    };
  });

  return result;
};



  useEffect(() => {
    const selecto = new Selecto({
      container: document.body,
      dragContainer: ".content", // 你可能需要将这个值改为你的容器的选择器
      selectableTargets: [".time-cell"], // 设置可选的目标为.time-cell
      hitRate: 0, // 可选的区域比例为0，即完全包含在内的元素才会被选中
      selectByClick: true, // 可以通过点击选中元素
      selectFromInside: true, // 可以从内部开始选择
      toggleContinueSelect: ["shift"], // 按住Shift键可以进行连续选择
    });

    // 当选中元素时的事件处理器
    selecto.on("selectEnd", ({ selected }) => {
      let newSelected = []; // 创建一个新的 selected 数组
      selected.forEach(element => {
        if (element.classList.contains("time-cell")) {
          const dataKey = element.getAttribute('data-key').split('-');
          const dayKey = dataKey[0]; // 对应 initialTableData 的 key
          const timeNum = dataKey[1]; // 对应 hour_sections 的 num
          // 找到对应的对象
          const dayObj = table_data.find(item => item.day == dayKey);
          const timeObj = dayObj.hour_sections.find(item => item.num == timeNum);
          // console.log('before', timeObj);
          if (selected.length === 1) {
            // 如果是单击，就切换选中状态和背景色
            if (timeObj.selected == false) {
              timeObj.selected = true
              element.style.backgroundColor = "cornflowerblue"

            } else {
              timeObj.selected = false
              element.style.backgroundColor = "transparent"

            }
          } else {
            // 如果是框选，就只设置选中状态和背景色，不进行切换
            if (timeObj.selected == false) {
              timeObj.selected = true
              element.style.backgroundColor = "cornflowerblue"

            }
          }
          // console.log('after', timeObj);
        }
      })
      table_data.forEach(dayObj => {
        dayObj.hour_sections.forEach(timeObj => {
          if (timeObj.selected) {
            newSelected.push(timeObj); // 如果这个对象被选中了，就添加到新的 selected 数组中
          }
        });
      });

      setSelectedList(processSelectedList(newSelected)); // 更新 selected 状态
    });
    // console.log('Component has been mounted!', table_data);
  }, []);
  useEffect(() => {
    console.log('selectedList', selectedList)
  }, [selectedList])
  const num_time_convert2 = (num) => {
    let baseTime = dayjs().startOf('day')
    let startTime = baseTime.add(num * 30, 'minute')
    let endTime = startTime.add(30, 'minute')
    return (`${startTime.format('HH:mm')}-${endTime.format('HH:mm')}`)
  }

  const initialTableData = [
    {
      day: '星期一',
      key: 1,
    },
    {
      day: '星期二',
      key: 2,
    },
    {
      day: '星期三',
      key: 3,
    },
    {
      day: '星期四',
      key: 4,
    },
    {
      day: '星期五',
      key: 5,
    },
    {
      day: '星期六',
      key: 6,
    },
    {
      day: '星期日',
      key: 7,
    }
  ].map((item) => {
    const newItem = { ...item };
    newItem.hour_sections = [];
    for (let i = 0; i < 48; i++) {
      newItem.hour_sections.push({
        num: i,//时间段的对应key值
        selected: false,//网格是否已选择
        time: num_time_convert2(i),
        weekday: item.day
      });
    }
    return newItem;
  })

  const content = (day, time) => {
    return (
      <div >
        <div>{day}</div>
        <div>{time}</div>
      </div>
    )
  }

  const clear = () => {

    setSelectedList([])
  
 
    const newTableData = table_data.map(dayObj => {
      dayObj.hour_sections.forEach(timeObj => {
        timeObj.selected = false;
      });
      return dayObj;
    });
  
    setTable_data(newTableData);
  
    const timeCells = document.querySelectorAll('.time-cell');
    timeCells.forEach(cell => {
      if (cell.style.backgroundColor === 'cornflowerblue') {
        cell.style.backgroundColor = 'transparent';
      }
    });
  }
  

  const [table_data, setTable_data] = useState(initialTableData);

  const contentRef = useRef(null)

  const time_range = [
    {
      title: '00:00 - 12:00',
      hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    },
    {
      title: '12:00 - 24:00',
      hours: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
    }
  ]



  return (
    <div className='container'>

      <div className='top'>
        <div style={{ width: "10px", height: "2px", backgroundColor: "cornflowerblue", marginRight: "10px" }}></div>
        <div style={{ marginRight: "10px" }}>已选</div>
        <div style={{ width: "10px", height: "2px", backgroundColor: "gray", marginRight: "10px" }}></div>
        <div style={{ marginRight: "10px" }}>可选</div>
      </div>
      <div className='table'>
        <div className='title'>
          <div className='title-left'>星期/时间</div>
          <div className='title-right'>
            {
              time_range.map((item, index) => {
                return (
                  <div className='title-cell' key={index}>
                    <div className='title-cell-title'>
                      {item.title}
                    </div>
                    <div className='title-cell-content' >
                      {item.hours.map((ele, innerIndex) => {
                        return (
                          <div className='inner-cell' key={innerIndex}>{ele}</div>
                        )
                      })}
                    </div>
                  </div>)
              })
            }
          </div>
        </div>
        <div className='content' ref={contentRef}>
          {table_data.map((item, index) => {
            return (
              <div className='content-cell' key={index}>
                <div className='content-cell-title'>{item.day}</div>
                <div className='times'>
                  {item.hour_sections.map((ele, innerIndex) => {
                    return (
                      <Popover
                        content={content(item.day, ele.time)}
                      >
                        <div className='time-cell'
                          data-key={item.day + '-' + ele.num}
                          key={innerIndex}></div>
                      </Popover>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className='bottom'>
        <div style={{ flex: 3.5, display: "flex", justifyContent: "center", alignItems: "center" }}>已选择时间段</div>
   
        <div className='selected_time' style={{ flex: 1 }} onClick={clear}>清空</div>
      </div>
      <div className='list'>
        {selectedList.map((item) => {
          if(item.list.length>0){
            return (
              <div className='list-cell'>
                <div className='cell-title'>{item.day}:</div>
                <div className='cell-content'>{item.list.join(',')}</div>
              </div>
            )
          }else{
            return null
          }
       
        })}
      </div>
    </div>
  );
}

export default App;




