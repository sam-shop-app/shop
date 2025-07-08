import { Link } from "react-router-dom";
import { Card, CardBody, Divider, Link as HeroLink } from "@heroui/react";

const Footer = () => {
  return (
    <footer className="py-12 bg-background border-t">
      <section>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <Card shadow="none" className="border-none bg-transparent">
            <CardBody>
              <h3 className="text-sm font-semibold text-foreground/90 tracking-wider uppercase mb-4">
                关于我们
              </h3>
              <p className="text-foreground/60">
                山姆闪购是您身边的智能购物平台，为您提供优质商品和极致服务。
              </p>
            </CardBody>
          </Card>

          {/* Quick Links */}
          <Card shadow="none" className="border-none bg-transparent">
            <CardBody>
              <h3 className="text-sm font-semibold text-foreground/90 tracking-wider uppercase mb-4">
                快速链接
              </h3>
              <ul className="space-y-3">
                <li>
                  <HeroLink
                    as={Link}
                    to="/about"
                    color="foreground"
                    underline="hover"
                  >
                    关于我们
                  </HeroLink>
                </li>
                <li>
                  <HeroLink
                    as={Link}
                    to="/contact"
                    color="foreground"
                    underline="hover"
                  >
                    联系我们
                  </HeroLink>
                </li>
                <li>
                  <HeroLink
                    as={Link}
                    to="/faq"
                    color="foreground"
                    underline="hover"
                  >
                    常见问题
                  </HeroLink>
                </li>
              </ul>
            </CardBody>
          </Card>

          {/* Customer Service */}
          <Card shadow="none" className="border-none bg-transparent">
            <CardBody>
              <h3 className="text-sm font-semibold text-foreground/90 tracking-wider uppercase mb-4">
                客户服务
              </h3>
              <ul className="space-y-3">
                <li>
                  <HeroLink
                    as={Link}
                    to="/shipping"
                    color="foreground"
                    underline="hover"
                  >
                    配送说明
                  </HeroLink>
                </li>
                <li>
                  <HeroLink
                    as={Link}
                    to="/returns"
                    color="foreground"
                    underline="hover"
                  >
                    退换货政策
                  </HeroLink>
                </li>
                <li>
                  <HeroLink
                    as={Link}
                    to="/privacy"
                    color="foreground"
                    underline="hover"
                  >
                    隐私政策
                  </HeroLink>
                </li>
              </ul>
            </CardBody>
          </Card>

          {/* Contact Info */}
          <Card shadow="none" className="border-none bg-transparent">
            <CardBody>
              <h3 className="text-sm font-semibold text-foreground/90 tracking-wider uppercase mb-4">
                联系方式
              </h3>
              <ul className="space-y-3">
                <li className="text-foreground/60">
                  <span className="block">客服电话：400-123-4567</span>
                  <span className="block">服务时间：9:00-21:00</span>
                </li>
                <li className="text-foreground/60">
                  <span className="block">邮箱：support@samshop.com</span>
                </li>
              </ul>
            </CardBody>
          </Card>
        </div>

        <Divider className="my-8" />

        {/* Bottom Section */}
        <div className="text-center">
          <p className="text-sm text-foreground/60">
            © {new Date().getFullYear()} 山姆闪购. 保留所有权利.
          </p>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
