// src/components/Carousel.tsx

import { useRef, type FC, type PropsWithChildren } from "react";

// Swiper 组件和模块
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperCore } from "swiper";

// Swiper 核心样式
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// 其他依赖
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";

// -----------------------------------------------------------------------------
// 1. 定义 Carousel.Item 子组件
// -----------------------------------------------------------------------------

interface CarouselItemProps extends PropsWithChildren {
  className?: string;
}

const CarouselItem: FC<CarouselItemProps> = ({ children, className }) => {
  return (
    <SwiperSlide className={clsx("w-full flex-shrink-0", className)}>
      {children}
    </SwiperSlide>
  );
};

// -----------------------------------------------------------------------------
// 2. 定义 Carousel 主组件的 Props
// -----------------------------------------------------------------------------

interface CarouselProps extends PropsWithChildren {
  className?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  showArrows?: boolean;
  showDots?: boolean;
  hideControls?: boolean;
}

// -----------------------------------------------------------------------------
// 3. 定义 Carousel 主组件
// -----------------------------------------------------------------------------

// 使用类型断言来扩展 Carousel 类型，使其可以挂载 Item 组件
type CarouselComponent = FC<CarouselProps> & {
  Item: FC<CarouselItemProps>;
};

export const Carousel: CarouselComponent = ({
  children,
  className,
  autoplay = false,
  autoplayDelay = 3000,
  showArrows = false,
  showDots = true,
  hideControls = false,
}) => {
  const navigationPrevRef = useRef<HTMLButtonElement>(null);
  const navigationNextRef = useRef<HTMLButtonElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  const modules = [];
  if (autoplay) modules.push(Autoplay);
  if (showArrows && !hideControls) modules.push(Navigation);
  if (showDots && !hideControls) modules.push(Pagination);

  const handleSwiperInit = (swiper: SwiperCore) => {
    // 动态连接导航元素
    if (swiper.params.navigation) {
      if (typeof swiper.params.navigation !== "boolean") {
        swiper.params.navigation.prevEl = navigationPrevRef.current;
        swiper.params.navigation.nextEl = navigationNextRef.current;
      }
    }
    // 动态连接分页器元素
    if (swiper.params.pagination) {
      if (typeof swiper.params.pagination !== "boolean") {
        swiper.params.pagination.el = paginationRef.current;
      }
    }
    swiper.navigation.init();
    swiper.navigation.update();
    swiper.pagination.init();
    swiper.pagination.render();
    swiper.pagination.update();
  };

  return (
    <div className={clsx("relative group", className)}>
      <Swiper
        onInit={handleSwiperInit}
        modules={modules}
        loop={true}
        autoplay={
          autoplay
            ? {
                delay: autoplayDelay,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        pagination={
          showDots && !hideControls
            ? {
                el: paginationRef.current,
                clickable: true,
                bulletClass: "swiper-pagination-bullet", // 使用默认类名
                bulletActiveClass: "swiper-pagination-bullet-active", // 使用默认类名
              }
            : false
        }
        navigation={
          showArrows && !hideControls
            ? {
                prevEl: navigationPrevRef.current,
                nextEl: navigationNextRef.current,
              }
            : false
        }
        className="w-full h-full"
      >
        {children}
      </Swiper>

      {/* 导航箭头 (Arrows) */}
      {!hideControls && showArrows && (
        <>
          <button
            ref={navigationPrevRef}
            className={clsx(
              "absolute top-1/2 -translate-y-1/2 left-4 z-10",
              "flex items-center justify-center w-10 h-10 bg-white/60 dark:bg-black/60 rounded-full",
              "text-neutral-800 dark:text-neutral-200",
              "transition-opacity duration-300 opacity-0 group-hover:opacity-100",
              "hover:bg-white dark:hover:bg-black",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              "disabled:opacity-0 disabled:cursor-not-allowed",
            )}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            ref={navigationNextRef}
            className={clsx(
              "absolute top-1/2 -translate-y-1/2 right-4 z-10",
              "flex items-center justify-center w-10 h-10 bg-white/60 dark:bg-black/60 rounded-full",
              "text-neutral-800 dark:text-neutral-200",
              "transition-opacity duration-300 opacity-0 group-hover:opacity-100",
              "hover:bg-white dark:hover:bg-black",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              "disabled:opacity-0 disabled:cursor-not-allowed",
            )}
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* 分页器 (Dots) */}
      {!hideControls && showDots && (
        <div
          ref={paginationRef}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-x-2"
        >
          {/* Swiper会在这里动态渲染分页点 */}
          {/* 我们通过CSS自定义分页点的样式 */}
        </div>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// 4. 将 Item 组件挂载到 Carousel 上，并导出
// -----------------------------------------------------------------------------

Carousel.Item = CarouselItem;
